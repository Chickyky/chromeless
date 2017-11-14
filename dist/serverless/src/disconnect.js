"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var AWS = require('aws-sdk');
var utils_1 = require('./utils');
var iotData = new AWS.IotData({ endpoint: process.env.AWS_IOT_HOST });
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = function (_a, context, callback) __awaiter(this, void 0, Promise, function* () {
    var channelId = _a.channelId;
    utils_1.debug('Disconnect on', channelId);
    var params = {
        topic: "chrome/" + channelId + "/end",
        payload: JSON.stringify({ channelId: channelId, client: true, disconnected: true }),
        qos: 1,
    };
    iotData.publish(params, callback);
});
//# sourceMappingURL=disconnect.js.map