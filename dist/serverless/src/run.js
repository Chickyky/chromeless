"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
require('source-map-support/register');
var chromeless_1 = require('chromeless');
var mqtt_1 = require('mqtt');
var utils_1 = require('./utils');
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = function (_a, context, callback, chromeInstance) __awaiter(this, void 0, Promise, function* () {
    var channelId = _a.channelId, options = _a.options;
    // used to block requests from being processed while we're exiting
    var endingInvocation = false;
    var timeout;
    var executionCheckInterval;
    utils_1.debug('Invoked with data: ', channelId, options);
    var chrome = new (chromeless_1.LocalChrome.bind.apply(chromeless_1.LocalChrome, [void 0].concat([{}], options, [remote, false, launchChrome, false, cdp, { closeTab: true }])))();
});
var queue = new chromeless_1.Queue(chrome);
var TOPIC_CONNECTED = "chrome/" + channelId + "/connected";
var TOPIC_REQUEST = "chrome/" + channelId + "/request";
var TOPIC_RESPONSE = "chrome/" + channelId + "/response";
var TOPIC_END = "chrome/" + channelId + "/end";
var channel = mqtt_1.connect(utils_1.createPresignedURL());
if (process.env.DEBUG) {
    channel.on('error', function (error) { return utils_1.debug('WebSocket error', error); });
    channel.on('offline', function () { return utils_1.debug('WebSocket offline'); });
}
/*
  Clean up function whenever we want to end the invocation.
  Importantly we publish a message that we're disconnecting, and then
  we kill the running Chrome instance.
*/
var end = function (topic_end_data) {
    if (topic_end_data === void 0) { topic_end_data = {}; }
    if (!endingInvocation) {
        endingInvocation = true;
        clearInterval(executionCheckInterval);
        clearTimeout(timeout);
        channel.unsubscribe(TOPIC_END, function () {
            channel.publish(TOPIC_END, JSON.stringify.apply(JSON, [{ channelId: channelId, chrome: true, }].concat(topic_end_data)));
        }), {
            qos: 0,
        }, function () __awaiter(this, void 0, void 0, function* () {
            channel.end();
            yield chrome.close();
            yield chromeInstance.kill();
            callback();
        });
    }
};
var newTimeout = function () {
    return setTimeout(function () __awaiter(this, void 0, void 0, function* () {
        utils_1.debug('Timing out. No requests received for 30 seconds.');
        yield end({ inactivity: true });
    }), 30000);
};
/*
  When we're almost out of time, we clean up.
  Importantly this makes sure that Chrome isn't running on the next invocation
  and publishes a message to the client letting it know we're disconnecting.
*/
executionCheckInterval = setInterval(function () __awaiter(this, void 0, void 0, function* () {
    if (context.getRemainingTimeInMillis() < 5000) {
        utils_1.debug('Ran out of execution time.');
        yield end({ outOfTime: true });
    }
}), 1000);
channel.on('connect', function () {
    utils_1.debug('Connected to AWS IoT broker');
    /*
      Publish that we've connected. This lets the client know that
      it can start sending requests (commands) for us to process.
    */
    channel.publish(TOPIC_CONNECTED, JSON.stringify({}), { qos: 1 });
    /*
      The main bit. Listen for requests from the client, handle them
      and respond with the result.
    */
    channel.subscribe(TOPIC_REQUEST, function () {
        utils_1.debug("Subscribed to " + TOPIC_REQUEST);
        timeout = newTimeout();
        channel.on('message', function (topic, buffer) __awaiter(this, void 0, void 0, function* () {
            if (TOPIC_REQUEST === topic && !endingInvocation) {
                var message = buffer.toString();
                clearTimeout(timeout);
                utils_1.debug("Message from " + TOPIC_REQUEST, message);
                var command = JSON.parse(message);
                try {
                    var result = yield queue.process(command);
                    var remoteResult = JSON.stringify({
                        value: result,
                    });
                    utils_1.debug('Chrome result', result);
                    channel.publish(TOPIC_RESPONSE, remoteResult, { qos: 1 });
                }
                catch (error) {
                    var remoteResult = JSON.stringify({
                        error: error.toString(),
                    });
                    utils_1.debug('Chrome error', error);
                    channel.publish(TOPIC_RESPONSE, remoteResult, { qos: 1 });
                }
                timeout = newTimeout();
            }
        }));
    });
    /*
      Handle diconnection from the client.
      Either the client purposfully ended the session, or the client
      connection was abruptly ended resulting in a last-will message
      being dispatched by the IoT MQTT broker.
      */
    channel.subscribe(TOPIC_END, function () __awaiter(this, void 0, void 0, function* () {
        channel.on('message', function (topic, buffer) __awaiter(this, void 0, void 0, function* () {
            if (TOPIC_END === topic) {
                var message = buffer.toString();
                var data = JSON.parse(message);
                utils_1.debug("Message from " + TOPIC_END, message);
                utils_1.debug("Client " + (data.disconnected ? 'disconnected' : 'ended session') + ".");
                yield end();
                utils_1.debug('Ended successfully.');
            }
        }));
    }));
});
//# sourceMappingURL=run.js.map