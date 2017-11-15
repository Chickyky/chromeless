"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var aws4 = require("aws4");
/*
  This creates a presigned URL for accessing the AWS IoT MQTT Broker.
  Notably, the sessionToken is simply tacked on to the end, and not signed.
  Because AWS. Thank you @shortjared for your help pointing this out.
*/
function createPresignedURL(_a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.host, host = _c === void 0 ? process.env.AWS_IOT_HOST : _c, _d = _b.path, path = _d === void 0 ? '/mqtt' : _d, _e = _b.region, region = _e === void 0 ? process.env.AWS_REGION : _e, _f = _b.service, service = _f === void 0 ? 'iotdevicegateway' : _f, _g = _b.accessKeyId, accessKeyId = _g === void 0 ? process.env.AWS_ACCESS_KEY_ID : _g, _h = _b.secretAccessKey, secretAccessKey = _h === void 0 ? process.env.AWS_SECRET_ACCESS_KEY : _h, _j = _b.sessionToken, sessionToken = _j === void 0 ? process.env.AWS_SESSION_TOKEN : _j;
    var signed = aws4.sign({
        host: host,
        path: path,
        service: service,
        region: region,
        signQuery: true,
    }, {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
    });
    return "wss://" + host + signed.path + "&X-Amz-Security-Token=" + encodeURIComponent(sessionToken);
}
exports.createPresignedURL = createPresignedURL;
function debug() {
    var log = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        log[_i] = arguments[_i];
    }
    if (process.env.DEBUG) {
        console.log.apply(console, log.map(function (argument) {
            return typeof argument === 'object'
                ? JSON.stringify(argument, null, 2)
                : argument;
        }));
    }
}
exports.debug = debug;
//# sourceMappingURL=utils.js.map