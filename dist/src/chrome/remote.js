"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var mqtt_1 = require('mqtt');
var got = require('got');
function getEndpoint(remoteOptions) {
    if (typeof remoteOptions === 'object' && remoteOptions.endpointUrl) {
        return remoteOptions;
    }
    if (process.env['CHROMELESS_ENDPOINT_URL'] &&
        process.env['CHROMELESS_ENDPOINT_API_KEY']) {
        return {
            endpointUrl: process.env['CHROMELESS_ENDPOINT_URL'],
            apiKey: process.env['CHROMELESS_ENDPOINT_API_KEY'],
        };
    }
    throw new Error('No Chromeless remote endpoint & API key provided. Either set as "remote" option in constructor or set as "CHROMELESS_ENDPOINT_URL" and "CHROMELESS_ENDPOINT_API_KEY" env variables.');
}
var RemoteChrome = (function () {
    function RemoteChrome(options) {
        this.options = options;
        this.connectionPromise = this.initConnection();
    }
    RemoteChrome.prototype.initConnection = function () {
        return __awaiter(this, void 0, Promise, function* () {
            var _this = this;
            yield new Promise(function (resolve, reject) __awaiter(this, void 0, void 0, function* () {
                var timeout = setTimeout(function () {
                    if (_this.channel) {
                        _this.channel.end();
                    }
                    reject(new Error("Timed out after 30sec. Connection couldn't be established."));
                }, 30000);
                try {
                    var _a = getEndpoint(_this.options.remote), endpointUrl = _a.endpointUrl, apiKey = _a.apiKey;
                    var _b = (yield got(endpointUrl, {
                        headers: apiKey
                            ? {
                                'x-api-key': apiKey,
                            }
                            : undefined,
                        json: true,
                    })).body, url = _b.url, channelId_1 = _b.channelId;
                    _this.channelId = channelId_1;
                    _this.TOPIC_NEW_SESSION = 'chrome/new-session';
                    _this.TOPIC_CONNECTED = "chrome/" + channelId_1 + "/connected";
                    _this.TOPIC_REQUEST = "chrome/" + channelId_1 + "/request";
                    _this.TOPIC_RESPONSE = "chrome/" + channelId_1 + "/response";
                    _this.TOPIC_END = "chrome/" + channelId_1 + "/end";
                    var channel_1 = mqtt_1.connect(url, {
                        will: {
                            topic: 'chrome/last-will',
                            payload: JSON.stringify({ channelId: channelId_1 }),
                            qos: 1,
                            retain: false,
                        },
                    });
                    _this.channel = channel_1;
                    if (_this.options.debug) {
                        channel_1.on('error', function (error) { return console.log('WebSocket error', error); });
                        channel_1.on('offline', function () { return console.log('WebSocket offline'); });
                    }
                    channel_1.on('connect', function () {
                        if (_this.options.debug) {
                            console.log('Connected to message broker.');
                        }
                        channel_1.subscribe(_this.TOPIC_CONNECTED, { qos: 1 }, function () {
                            channel_1.on('message', async, function (topic) {
                                if (_this.TOPIC_CONNECTED === topic) {
                                    clearTimeout(timeout);
                                    resolve();
                                }
                            });
                            channel_1.publish(_this.TOPIC_NEW_SESSION, JSON.stringify({ channelId: channelId_1, options: _this.options }), { qos: 1 });
                        });
                        channel_1.subscribe(_this.TOPIC_END, function () {
                            channel_1.on('message', function (topic, buffer) __awaiter(this, void 0, void 0, function* () {
                                if (_this.TOPIC_END === topic) {
                                    var message = buffer.toString();
                                    var data = JSON.parse(message);
                                    if (data.outOfTime) {
                                        console.warn("Chromeless Proxy disconnected because it reached it's execution time limit (5 minutes).");
                                    }
                                    else if (data.inactivity) {
                                        console.warn('Chromeless Proxy disconnected due to inactivity (no commands sent for 30 seconds).');
                                    }
                                    else {
                                        console.warn("Chromeless Proxy disconnected (we don't know why).", data);
                                    }
                                    yield _this.close();
                                }
                            }));
                        });
                    });
                }
                catch (error) {
                    console.error(error);
                    reject(new Error('Unable to get presigned websocket URL and connect to it.'));
                }
            }));
        });
    };
    RemoteChrome.prototype.process = function (command) {
        return __awaiter(this, void 0, Promise, function* () {
            var _this = this;
            // wait until lambda connection is established
            yield this.connectionPromise;
            if (this.options.debug) {
                console.log("Running remotely: " + JSON.stringify(command));
            }
            var promise = new Promise(function (resolve, reject) {
                _this.channel.subscribe(_this.TOPIC_RESPONSE, function () {
                    _this.channel.on('message', function (topic, buffer) {
                        if (_this.TOPIC_RESPONSE === topic) {
                            var message = buffer.toString();
                            var result = JSON.parse(message);
                            if (result.error) {
                                reject(result.error);
                            }
                            else if (result.value) {
                                resolve(result.value);
                            }
                            else {
                                resolve();
                            }
                        }
                    });
                    _this.channel.publish(_this.TOPIC_REQUEST, JSON.stringify(command));
                });
            });
            return promise;
        });
    };
    RemoteChrome.prototype.close = function () {
        return __awaiter(this, void 0, Promise, function* () {
            this.channel.publish(this.TOPIC_END, JSON.stringify({ channelId: this.channelId, client: true }));
            this.channel.end();
        });
    };
    return RemoteChrome;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RemoteChrome;
//# sourceMappingURL=remote.js.map