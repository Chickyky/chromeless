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
var path = require('path');
var cuid = require('cuid');
var CDP = require('chrome-remote-interface');
var AWS = require('aws-sdk');
exports.version = (function () {
    if (fs.existsSync(path.join(__dirname, '../package.json'))) {
        // development (look in /src)
        return require('../package.json').version;
    }
    else {
        // production (look in /dist/src)
        return require('../../package.json').version;
    }
})();
function setViewport(client, viewport) {
    return __awaiter(this, void 0, Promise, function* () {
        if (viewport === void 0) { viewport = { width: 1, height: 1, scale: 1 }; }
        var config = {
            deviceScaleFactor: 1,
            mobile: false,
            scale: viewport.scale || 1,
            fitWindow: false,
        };
        var versionResult = yield CDP.Version();
        var isHeadless = versionResult['User-Agent'].includes('Headless');
        if (viewport.height && viewport.width) {
            config.height = viewport.height;
            config.width = viewport.width;
        }
        else if (isHeadless) {
            // just apply default value in headless mode to maintain original browser viewport
            config.height = 900;
            config.width = 1440;
        }
        else {
            config.height = yield evaluate(client, (function () { return window.innerHeight; }).toString());
            config.width = yield evaluate(client, (function () { return window.innerWidth; }).toString());
        }
        yield client.Emulation.setDeviceMetricsOverride(config);
        yield client.Emulation.setVisibleSize({
            width: config.width,
            height: config.height,
        });
        return;
    });
}
exports.setViewport = setViewport;
function waitForNode(client, selector, waitTimeout) {
    return __awaiter(this, void 0, Promise, function* () {
        var Runtime = client.Runtime;
        var getNode = "selector => {\n    return document.querySelector(selector)\n  }";
        var result = yield Runtime.evaluate({
            expression: "(" + getNode + ")(`" + selector + "`)",
        });
        if (result.result.value === null) {
            var start_1 = new Date().getTime();
            return new Promise(function (resolve, reject) {
                var interval = setInterval(function () __awaiter(this, void 0, void 0, function* () {
                    if (new Date().getTime() - start_1 > waitTimeout) {
                        clearInterval(interval);
                        reject(new Error("wait(\"" + selector + "\") timed out after " + waitTimeout + "ms"));
                    }
                    var result = yield Runtime.evaluate({
                        expression: "(" + getNode + ")(`" + selector + "`)",
                    });
                    if (result.result.value !== null) {
                        clearInterval(interval);
                        resolve();
                    }
                }), 500);
            });
        }
        else {
            return;
        }
    });
}
exports.waitForNode = waitForNode;
function wait(timeout) {
    return __awaiter(this, void 0, Promise, function* () {
        return new Promise(function (resolve, reject) { return setTimeout(resolve, timeout); });
    });
}
exports.wait = wait;
function nodeExists(client, selector) {
    return __awaiter(this, void 0, Promise, function* () {
        var Runtime = client.Runtime;
        var exists = "selector => {\n    return !!document.querySelector(selector)\n  }";
        var expression = "(" + exists + ")(`" + selector + "`)";
        var result = yield Runtime.evaluate({
            expression: expression,
        });
        return result.result.value;
    });
}
exports.nodeExists = nodeExists;
function getClientRect(client, selector) {
    return __awaiter(this, void 0, Promise, function* () {
        var Runtime = client.Runtime;
        var code = "selector => {\n    const element = document.querySelector(selector)\n    if (!element) {\n      return undefined\n    }\n\n    const rect = element.getBoundingClientRect()\n    return JSON.stringify({\n      left: rect.left,\n      top: rect.top,\n      right: rect.right,\n      bottom: rect.bottom,\n      height: rect.height,\n      width: rect.width,\n    })\n  }";
        var expression = "(" + code + ")(`" + selector + "`)";
        var result = yield Runtime.evaluate({ expression: expression });
        if (!result.result.value) {
            throw new Error("No element found for selector: " + selector);
        }
        return JSON.parse(result.result.value);
    });
}
exports.getClientRect = getClientRect;
function click(client, selector, scale) {
    return __awaiter(this, void 0, void 0, function* () {
        var clientRect = yield getClientRect(client, selector);
        var Input = client.Input;
        var options = {
            x: Math.round((clientRect.left + clientRect.width / 2) * scale),
            y: Math.round((clientRect.top + clientRect.height / 2) * scale),
            button: 'left',
            clickCount: 1,
        };
        yield Input.dispatchMouseEvent.apply(Input, [{}].concat(options, [type, 'mousePressed']));
    });
}
exports.click = click;
yield Input.dispatchMouseEvent.apply(Input, [{}].concat(options, [type, 'mouseReleased']));
function focus(client, selector) {
    return __awaiter(this, void 0, Promise, function* () {
        var DOM = client.DOM;
        var dom = yield DOM.getDocument();
        var node = yield DOM.querySelector({
            nodeId: dom.root.nodeId,
            selector: selector,
        });
        yield DOM.focus(node);
    });
}
exports.focus = focus;
function evaluate(client, fn) {
    return __awaiter(this, void 0, Promise, function* () {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var Runtime = client.Runtime;
        var jsonArgs = JSON.stringify(args);
        var argStr = jsonArgs.substr(1, jsonArgs.length - 2);
        var expression = "\n    (() => {\n      const expressionResult = (" + fn + ")(" + argStr + ");\n      if (expressionResult && expressionResult.then) {\n        expressionResult.catch((error) => { throw new Error(error); });\n        return expressionResult;\n      }\n      return Promise.resolve(expressionResult);\n    })();\n  ";
        var result = yield Runtime.evaluate({
            expression: expression,
            returnByValue: true,
            awaitPromise: true,
        });
        if (result && result.exceptionDetails) {
            throw new Error(result.exceptionDetails.exception.value ||
                result.exceptionDetails.exception.description);
        }
        if (result && result.result) {
            return result.result.value;
        }
        return null;
    });
}
exports.evaluate = evaluate;
function type(client, text, selector) {
    return __awaiter(this, void 0, Promise, function* () {
        if (selector) {
            yield focus(client, selector);
            yield wait(500);
        }
        var Input = client.Input;
        for (var i = 0; i < text.length; i++) {
            var char = text[i];
            var options = {
                type: 'char',
                text: char,
                unmodifiedText: char,
            };
            yield Input.dispatchKeyEvent(options);
        }
    });
}
exports.type = type;
function press(client, keyCode, count, modifiers) {
    return __awaiter(this, void 0, Promise, function* () {
        var Input = client.Input;
        if (count === undefined) {
            count = 1;
        }
        var options = {
            nativeVirtualKeyCode: keyCode,
            windowsVirtualKeyCode: keyCode,
        };
        if (modifiers) {
            options['modifiers'] = modifiers;
        }
        for (var i = 0; i < count; i++) {
            yield Input.dispatchKeyEvent.apply(Input, [{}].concat(options, [type, 'rawKeyDown']));
        }
        yield Input.dispatchKeyEvent.apply(Input, [{}].concat(options, [type, 'keyUp']));
    });
}
exports.press = press;
function getValue(client, selector) {
    return __awaiter(this, void 0, Promise, function* () {
        var Runtime = client.Runtime;
        var browserCode = "selector => {\n    return document.querySelector(selector).value\n  }";
        var expression = "(" + browserCode + ")(`" + selector + "`)";
        var result = yield Runtime.evaluate({
            expression: expression,
        });
        return result.result.value;
    });
}
exports.getValue = getValue;
function scrollTo(client, x, y) {
    return __awaiter(this, void 0, Promise, function* () {
        var Runtime = client.Runtime;
        var browserCode = "(x, y) => {\n    return window.scrollTo(x, y)\n  }";
        var expression = "(" + browserCode + ")(" + x + ", " + y + ")";
        yield Runtime.evaluate({
            expression: expression,
        });
    });
}
exports.scrollTo = scrollTo;
function scrollToElement(client, selector) {
    return __awaiter(this, void 0, Promise, function* () {
        var clientRect = yield getClientRect(client, selector);
        return scrollTo(client, clientRect.left, clientRect.top);
    });
}
exports.scrollToElement = scrollToElement;
function setHtml(client, html) {
    return __awaiter(this, void 0, Promise, function* () {
        var Page = client.Page;
        var frameId = (yield Page.getResourceTree()).frameTree.frame.id;
        yield Page.setDocumentContent({ frameId: frameId, html: html });
    });
}
exports.setHtml = setHtml;
function getCookies(client, nameOrQuery) {
    return __awaiter(this, void 0, Promise, function* () {
        var Network = client.Network;
        var fn = function () { return location.href; };
        var url = (yield evaluate(client, "" + fn));
        var result = yield Network.getCookies([url]);
        var cookies = result.cookies;
        if (typeof nameOrQuery !== 'undefined' && typeof nameOrQuery === 'string') {
            var filteredCookies = cookies.filter(function (cookie) { return cookie.name === nameOrQuery; });
            return filteredCookies;
        }
        return cookies;
    });
}
exports.getCookies = getCookies;
function getAllCookies(client) {
    return __awaiter(this, void 0, Promise, function* () {
        var Network = client.Network;
        var result = yield Network.getAllCookies();
        return result.cookies;
    });
}
exports.getAllCookies = getAllCookies;
function setCookies(client, cookies) {
    return __awaiter(this, void 0, Promise, function* () {
        var Network = client.Network;
        for (var _i = 0, cookies_1 = cookies; _i < cookies_1.length; _i++) {
            var cookie = cookies_1[_i];
            yield Network.setCookie.apply(Network, [{}].concat(cookie, [url, getUrlFromCookie(cookie)]));
        }
    });
}
exports.setCookies = setCookies;
function setExtraHTTPHeaders(client, headers) {
    return __awaiter(this, void 0, Promise, function* () {
        var Network = client.Network;
        yield Network.setExtraHTTPHeaders({ headers: headers });
    });
}
exports.setExtraHTTPHeaders = setExtraHTTPHeaders;
function mousedown(client, selector, scale) {
    return __awaiter(this, void 0, void 0, function* () {
        var clientRect = yield getClientRect(client, selector);
        var Input = client.Input;
        var options = {
            x: Math.round((clientRect.left + clientRect.width / 2) * scale),
            y: Math.round((clientRect.top + clientRect.height / 2) * scale),
            button: 'left',
            clickCount: 1,
        };
        yield Input.dispatchMouseEvent.apply(Input, [{}].concat(options, [type, 'mousePressed']));
    });
}
exports.mousedown = mousedown;
function mouseup(client, selector, scale) {
    return __awaiter(this, void 0, void 0, function* () {
        var clientRect = yield getClientRect(client, selector);
        var Input = client.Input;
        var options = {
            x: Math.round((clientRect.left + clientRect.width / 2) * scale),
            y: Math.round((clientRect.top + clientRect.height / 2) * scale),
            button: 'left',
            clickCount: 1,
        };
        yield Input.dispatchMouseEvent.apply(Input, [{}].concat(options, [type, 'mouseReleased']));
    });
}
exports.mouseup = mouseup;
function getUrlFromCookie(cookie) {
    var domain = cookie.domain.slice(1, cookie.domain.length);
    return "https://" + domain;
}
function deleteCookie(client, name, url) {
    return __awaiter(this, void 0, Promise, function* () {
        var Network = client.Network;
        yield Network.deleteCookie({ cookieName: name, url: url });
    });
}
exports.deleteCookie = deleteCookie;
function clearCookies(client) {
    return __awaiter(this, void 0, Promise, function* () {
        var Network = client.Network;
        yield Network.clearBrowserCookies();
    });
}
exports.clearCookies = clearCookies;
function getBoxModel(client, selector) {
    return __awaiter(this, void 0, Promise, function* () {
        var DOM = client.DOM;
        var documentNodeId = (yield DOM.getDocument()).root.nodeId;
        var nodeId = (yield DOM.querySelector({
            selector: selector,
            nodeId: documentNodeId,
        })).nodeId;
        var model = (yield DOM.getBoxModel({ nodeId: nodeId })).model;
        return model;
    });
}
exports.getBoxModel = getBoxModel;
function boxModelToViewPort(model, scale) {
    return {
        x: model.content[0],
        y: model.content[1],
        width: model.width,
        height: model.height,
        scale: scale,
    };
}
exports.boxModelToViewPort = boxModelToViewPort;
function screenshot(client, selector) {
    return __awaiter(this, void 0, Promise, function* () {
        var Page = client.Page;
        var captureScreenshotOptions = {
            format: 'png',
            fromSurface: true,
            clip: undefined,
        };
        if (selector) {
            var model = yield getBoxModel(client, selector);
            captureScreenshotOptions.clip = boxModelToViewPort(model, 1);
        }
        var screenshot = yield Page.captureScreenshot(captureScreenshotOptions);
        return screenshot.data;
    });
}
exports.screenshot = screenshot;
function html(client) {
    return __awaiter(this, void 0, Promise, function* () {
        var DOM = client.DOM;
        var nodeId = (yield DOM.getDocument()).root.nodeId;
        var outerHTML = (yield DOM.getOuterHTML({ nodeId: nodeId })).outerHTML;
        return outerHTML;
    });
}
exports.html = html;
function pdf(client, options) {
    return __awaiter(this, void 0, Promise, function* () {
        var Page = client.Page;
        var pdf = yield Page.printToPDF(options);
        return pdf.data;
    });
}
exports.pdf = pdf;
function clearInput(client, selector) {
    return __awaiter(this, void 0, Promise, function* () {
        yield wait(500);
        yield focus(client, selector);
        var Input = client.Input;
        var text = yield getValue(client, selector);
        var optionsDelete = {
            nativeVirtualKeyCode: 46,
            windowsVirtualKeyCode: 46,
        };
        var optionsBackspace = {
            nativeVirtualKeyCode: 8,
            windowsVirtualKeyCode: 8,
        };
        for (var i = 0; i < text.length; i++) {
            yield Input.dispatchKeyEvent.apply(Input, [{}].concat(optionsDelete, [type, 'rawKeyDown']));
        }
        Input.dispatchKeyEvent.apply(Input, [{}].concat(optionsDelete, [type, 'keyUp']));
    });
}
exports.clearInput = clearInput;
yield Input.dispatchKeyEvent.apply(Input, [{}].concat(optionsBackspace, [type, 'rawKeyDown']));
Input.dispatchKeyEvent.apply(Input, [{}].concat(optionsBackspace, [type, 'keyUp']));
function setFileInput(client, selector, files) {
    return __awaiter(this, void 0, Promise, function* () {
        var DOM = client.DOM;
        var dom = yield DOM.getDocument();
        var node = yield DOM.querySelector({
            nodeId: dom.root.nodeId,
            selector: selector,
        });
        return yield DOM.setFileInputFiles({ files: files, nodeId: node.nodeId });
    });
}
exports.setFileInput = setFileInput;
function getDebugOption() {
    if (process &&
        process.env &&
        process.env['DEBUG'] &&
        process.env['DEBUG'].includes('chromeless')) {
        return true;
    }
    return false;
}
exports.getDebugOption = getDebugOption;
function writeToFile(data, extension, filePathOverride) {
    var filePath = filePathOverride || path.join(os.tmpdir(), cuid() + "." + extension);
    fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
    return filePath;
}
exports.writeToFile = writeToFile;
function getS3BucketName() {
    return process.env['CHROMELESS_S3_BUCKET_NAME'];
}
function getS3BucketUrl() {
    return process.env['CHROMELESS_S3_BUCKET_URL'];
}
function getS3ObjectKeyPrefix() {
    return process.env['CHROMELESS_S3_OBJECT_KEY_PREFIX'] || '';
}
function isS3Configured() {
    return getS3BucketName() && getS3BucketUrl();
}
exports.isS3Configured = isS3Configured;
var s3ContentTypes = {
    'image/png': {
        extension: 'png'
    },
    'application/pdf': {
        extension: 'pdf'
    },
};
function uploadToS3(data, contentType) {
    return __awaiter(this, void 0, Promise, function* () {
        var s3ContentType = s3ContentTypes[contentType];
        if (!s3ContentType) {
            throw new Error("Unknown S3 Content type " + contentType);
        }
        var s3Path = "" + getS3ObjectKeyPrefix() + cuid() + "." + s3ContentType.extension;
        var s3 = new AWS.S3();
        yield s3
            .putObject({
            Bucket: getS3BucketName(),
            Key: s3Path,
            ContentType: contentType,
            ACL: 'public-read',
            Body: Buffer.from(data, 'base64'),
        })
            .promise();
        return "https://" + getS3BucketUrl() + "/" + s3Path;
    });
}
exports.uploadToS3 = uploadToS3;
//# sourceMappingURL=util.js.map