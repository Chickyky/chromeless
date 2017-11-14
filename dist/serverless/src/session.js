"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var cuid = require('cuid');
var utils_1 = require('./utils');
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = function (event, context, callback) __awaiter(this, void 0, Promise, function* () {
    var url = utils_1.createPresignedURL();
    var channelId = cuid();
    callback(null, {
        statusCode: 200,
        body: JSON.stringify({ url: url, channelId: channelId }),
    });
});
//# sourceMappingURL=session.js.map