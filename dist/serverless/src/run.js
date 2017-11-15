"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
var chromeless_1 = require("chromeless");
var mqtt_1 = require("mqtt");
var utils_1 = require("./utils");
exports.default = function (_a, context, callback, chromeInstance) {
    var channelId = _a.channelId, options = _a.options;
    return __awaiter(_this, void 0, void 0, function () {
        var _this = this;
        var endingInvocation, timeout, executionCheckInterval, chrome, queue, TOPIC_CONNECTED, TOPIC_REQUEST, TOPIC_RESPONSE, TOPIC_END, channel, end, newTimeout;
        return __generator(this, function (_b) {
            endingInvocation = false;
            utils_1.debug('Invoked with data: ', channelId, options);
            chrome = new chromeless_1.LocalChrome(__assign({}, options, { remote: false, launchChrome: false, cdp: { closeTab: true } }));
            queue = new chromeless_1.Queue(chrome);
            TOPIC_CONNECTED = "chrome/" + channelId + "/connected";
            TOPIC_REQUEST = "chrome/" + channelId + "/request";
            TOPIC_RESPONSE = "chrome/" + channelId + "/response";
            TOPIC_END = "chrome/" + channelId + "/end";
            channel = mqtt_1.connect(utils_1.createPresignedURL());
            if (process.env.DEBUG) {
                channel.on('error', function (error) { return utils_1.debug('WebSocket error', error); });
                channel.on('offline', function () { return utils_1.debug('WebSocket offline'); });
            }
            end = function (topic_end_data) {
                if (topic_end_data === void 0) { topic_end_data = {}; }
                if (!endingInvocation) {
                    endingInvocation = true;
                    clearInterval(executionCheckInterval);
                    clearTimeout(timeout);
                    channel.unsubscribe(TOPIC_END, function () {
                        channel.publish(TOPIC_END, JSON.stringify(__assign({ channelId: channelId, chrome: true }, topic_end_data)), {
                            qos: 0,
                        }, function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        channel.end();
                                        return [4 /*yield*/, chrome.close()];
                                    case 1:
                                        _a.sent();
                                        return [4 /*yield*/, chromeInstance.kill()];
                                    case 2:
                                        _a.sent();
                                        callback();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                    });
                }
            };
            newTimeout = function () {
                return setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                utils_1.debug('Timing out. No requests received for 30 seconds.');
                                return [4 /*yield*/, end({ inactivity: true })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); }, 30000);
            };
            /*
              When we're almost out of time, we clean up.
              Importantly this makes sure that Chrome isn't running on the next invocation
              and publishes a message to the client letting it know we're disconnecting.
            */
            executionCheckInterval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(context.getRemainingTimeInMillis() < 5000)) return [3 /*break*/, 2];
                            utils_1.debug('Ran out of execution time.');
                            return [4 /*yield*/, end({ outOfTime: true })];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2: return [2 /*return*/];
                    }
                });
            }); }, 1000);
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
                    channel.on('message', function (topic, buffer) { return __awaiter(_this, void 0, void 0, function () {
                        var message, command, result, remoteResult, error_1, remoteResult;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!(TOPIC_REQUEST === topic && !endingInvocation)) return [3 /*break*/, 5];
                                    message = buffer.toString();
                                    clearTimeout(timeout);
                                    utils_1.debug("Message from " + TOPIC_REQUEST, message);
                                    command = JSON.parse(message);
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, queue.process(command)];
                                case 2:
                                    result = _a.sent();
                                    remoteResult = JSON.stringify({
                                        value: result,
                                    });
                                    utils_1.debug('Chrome result', result);
                                    channel.publish(TOPIC_RESPONSE, remoteResult, { qos: 1 });
                                    return [3 /*break*/, 4];
                                case 3:
                                    error_1 = _a.sent();
                                    remoteResult = JSON.stringify({
                                        error: error_1.toString(),
                                    });
                                    utils_1.debug('Chrome error', error_1);
                                    channel.publish(TOPIC_RESPONSE, remoteResult, { qos: 1 });
                                    return [3 /*break*/, 4];
                                case 4:
                                    timeout = newTimeout();
                                    _a.label = 5;
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); });
                });
                /*
                  Handle diconnection from the client.
                  Either the client purposfully ended the session, or the client
                  connection was abruptly ended resulting in a last-will message
                  being dispatched by the IoT MQTT broker.
                  */
                channel.subscribe(TOPIC_END, function () { return __awaiter(_this, void 0, void 0, function () {
                    var _this = this;
                    return __generator(this, function (_a) {
                        channel.on('message', function (topic, buffer) { return __awaiter(_this, void 0, void 0, function () {
                            var message, data;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!(TOPIC_END === topic)) return [3 /*break*/, 2];
                                        message = buffer.toString();
                                        data = JSON.parse(message);
                                        utils_1.debug("Message from " + TOPIC_END, message);
                                        utils_1.debug("Client " + (data.disconnected ? 'disconnected' : 'ended session') + ".");
                                        return [4 /*yield*/, end()];
                                    case 1:
                                        _a.sent();
                                        utils_1.debug('Ended successfully.');
                                        _a.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        }); });
                        return [2 /*return*/];
                    });
                }); });
            });
            return [2 /*return*/];
        });
    });
};
//# sourceMappingURL=run.js.map