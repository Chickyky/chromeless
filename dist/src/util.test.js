"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var fs = require('fs');
var os = require('os');
var CDP = require('chrome-remote-interface');
var ava_1 = require('ava');
var src_1 = require('../src');
var testHtml = fs.readFileSync('./src/__tests__/test.html');
var testUrl = "data:text/html," + testHtml;
var getPngMetaData = function (filePath) __awaiter(this, void 0, Promise, function* () {
    var fd = fs.openSync(filePath, 'r');
    return yield new Promise(function (resolve) {
        fs.read(fd, Buffer.alloc(24), 0, 24, 0, function (err, bytesRead, buffer) { return resolve({
            width: buffer.readUInt32BE(16),
            height: buffer.readUInt32BE(20)
        }); });
    });
});
// POC
ava_1.default('evaluate (document.title)', async, function (t) {
    var chromeless = new src_1.default({ launchChrome: false });
    var title = yield chromeless
        .goto(testUrl)
        .evaluate(function () { return document.title; });
    yield chromeless.end();
    t.is(title, 'Title');
});
ava_1.default('screenshot and pdf path', async, function (t) {
    var chromeless = new src_1.default({ launchChrome: false });
    var screenshot = yield chromeless
        .goto(testUrl)
        .screenshot();
    var pdf = yield chromeless
        .goto(testUrl)
        .pdf();
    yield chromeless.end();
    var regex = new RegExp(os.tmpdir().replace(/\\/g, '\\\\'));
    t.regex(screenshot, regex);
    t.regex(pdf, regex);
});
ava_1.default('screenshot by selector', async, function (t) {
    var version = yield CDP.Version();
    var versionMajor = parseInt(/Chrome\/(\d+)/.exec(version['User-Agent'])[1]);
    // clipping will only work on chrome 61+
    var chromeless = new src_1.default({ launchChrome: false });
    var screenshot = yield chromeless
        .goto(testUrl)
        .screenshot('img');
    yield chromeless.end();
    var png = yield getPngMetaData(screenshot);
    t.is(png.width, versionMajor > 60 ? 512 : 1440);
    t.is(png.height, versionMajor > 60 ? 512 : 900);
});
//# sourceMappingURL=util.test.js.map