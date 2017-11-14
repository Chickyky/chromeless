"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var chromeless_1 = require('chromeless');
var serverlessChromelessVersion = require('../package.json').version;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = function (event, context, callback) __awaiter(this, void 0, Promise, function* () {
    callback(null, {
        statusCode: 200,
        body: JSON.stringify({
            chromeless: chromeless_1.version,
            serverlessChromeless: serverlessChromelessVersion,
        }),
    });
});
//# sourceMappingURL=version.js.map