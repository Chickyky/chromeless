"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var util_1 = require('../util');
var LocalRuntime = (function () {
    function LocalRuntime(client, chromelessOptions) {
        this.options =  || { filePath: undefined };
        this.data = yield util_1.pdf(this.client, cdpOptions);
        this.client = client;
        this.chromelessOptions = chromelessOptions;
    }
    LocalRuntime.prototype.run = function (command) {
        return __awaiter(this, void 0, Promise, function* () {
            switch (command.type) {
                case 'goto':
                    return this.goto(command.url);
                case 'setViewport':
                    return util_1.setViewport(this.client, command.options);
                case 'wait': {
                    if (command.selector) {
                        return this.waitSelector(command.selector, command.timeout);
                    }
                    else if (command.timeout) {
                        return this.waitTimeout(command.timeout);
                    }
                    else {
                        throw new Error('waitFn not yet implemented');
                    }
                }
                case 'clearCache':
                    return this.clearCache();
                case 'setUserAgent':
                    return this.setUserAgent(command.useragent);
                case 'click':
                    return this.click(command.selector);
                case 'returnCode':
                    return this.returnCode.apply(this, [command.fn].concat(command.args));
                case 'returnExists':
                    return this.returnExists(command.selector);
                case 'returnScreenshot':
                    return this.returnScreenshot(command.selector, command.options);
                case 'returnHtml':
                    return this.returnHtml();
                case 'returnPdf':
                    return this.returnPdf(command.options);
                case 'returnInputValue':
                    return this.returnInputValue(command.selector);
                case 'type':
                    return this.type(command.input, command.selector);
                case 'press':
                    return this.press(command.keyCode, command.count, command.modifiers);
                case 'scrollTo':
                    return this.scrollTo(command.x, command.y);
                case 'scrollToElement':
                    return this.scrollToElement(command.selector);
                case 'deleteCookies':
                    return this.deleteCookies(command.name, command.url);
                case 'clearCookies':
                    return this.clearCookies();
                case 'setHtml':
                    return this.setHtml(command.html);
                case 'cookies':
                    return this.cookies(command.nameOrQuery);
                case 'allCookies':
                    return this.allCookies();
                case 'setCookies':
                    return this.setCookies(command.nameOrCookies, command.value);
                case 'mousedown':
                    return this.mousedown(command.selector);
                case 'mouseup':
                    return this.mouseup(command.selector);
                case 'focus':
                    return this.focus(command.selector);
                case 'clearInput':
                    return this.clearInput(command.selector);
                case 'setFileInput':
                    return this.setFileInput(command.selector, command.files);
                default:
                    throw new Error("No such command: " + JSON.stringify(command));
            }
        });
    };
    LocalRuntime.prototype.goto = function (url) {
        return __awaiter(this, void 0, Promise, function* () {
            var _a = this.client, Network = _a.Network, Page = _a.Page;
            yield Promise.all([Network.enable(), Page.enable()]);
            if (!this.userAgentValue)
                this.userAgentValue = "Chromeless " + util_1.version;
            yield Network.setUserAgentOverride({ userAgent: this.userAgentValue });
            yield Page.navigate({ url: url });
            yield Page.loadEventFired();
            this.log("Navigated to " + url);
        });
    };
    LocalRuntime.prototype.clearCache = function () {
        return __awaiter(this, void 0, Promise, function* () {
            var Network = this.client.Network;
            var canClearCache = yield Network.canClearBrowserCache;
            if (canClearCache) {
                yield Network.clearBrowserCache();
                this.log("Cache is cleared");
            }
            else {
                this.log("Cache could not be cleared");
            }
        });
    };
    LocalRuntime.prototype.setUserAgent = function (useragent) {
        return __awaiter(this, void 0, Promise, function* () {
            this.userAgentValue = useragent;
            yield this.log("Set useragent to " + this.userAgentValue);
        });
    };
    LocalRuntime.prototype.waitTimeout = function (timeout) {
        return __awaiter(this, void 0, Promise, function* () {
            this.log("Waiting for " + timeout + "ms");
            yield util_1.wait(timeout);
        });
    };
    LocalRuntime.prototype.waitSelector = function (selector, waitTimeout) {
        return __awaiter(this, void 0, Promise, function* () {
            if (waitTimeout === void 0) { waitTimeout = this.chromelessOptions.waitTimeout; }
            this.log("Waiting for " + selector + " " + waitTimeout);
            yield util_1.waitForNode(this.client, selector, waitTimeout);
            this.log("Waited for " + selector);
        });
    };
    LocalRuntime.prototype.click = function (selector) {
        return __awaiter(this, void 0, Promise, function* () {
            if (this.chromelessOptions.implicitWait) {
                this.log("click(): Waiting for " + selector);
                yield util_1.waitForNode(this.client, selector, this.chromelessOptions.waitTimeout);
            }
            var exists = yield util_1.nodeExists(this.client, selector);
            if (!exists) {
                throw new Error("click(): node for selector " + selector + " doesn't exist");
            }
            var scale = this.chromelessOptions.viewport.scale;
            if (this.chromelessOptions.scrollBeforeClick) {
                yield util_1.scrollToElement(this.client, selector);
            }
            yield util_1.click(this.client, selector, scale);
            this.log("Clicked on " + selector);
        });
    };
    LocalRuntime.prototype.returnCode = function (fn) {
        return __awaiter(this, void 0, Promise, function* () {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return (yield util_1.evaluate.apply(void 0, [this.client, fn].concat(args)));
        });
    };
    LocalRuntime.prototype.scrollTo = function (x, y) {
        return __awaiter(this, void 0, Promise, function* () {
            return util_1.scrollTo(this.client, x, y);
        });
    };
    LocalRuntime.prototype.scrollToElement = function (selector) {
        return __awaiter(this, void 0, Promise, function* () {
            if (this.chromelessOptions.implicitWait) {
                this.log("scrollToElement(): Waiting for " + selector);
                yield util_1.waitForNode(this.client, selector, this.chromelessOptions.waitTimeout);
            }
            return util_1.scrollToElement(this.client, selector);
        });
    };
    LocalRuntime.prototype.mousedown = function (selector) {
        return __awaiter(this, void 0, Promise, function* () {
            if (this.chromelessOptions.implicitWait) {
                this.log("mousedown(): Waiting for " + selector);
                yield util_1.waitForNode(this.client, selector, this.chromelessOptions.waitTimeout);
            }
            var exists = yield util_1.nodeExists(this.client, selector);
            if (!exists) {
                throw new Error("mousedown(): node for selector " + selector + " doesn't exist");
            }
            var scale = this.chromelessOptions.viewport.scale;
            yield util_1.mousedown(this.client, selector, scale);
            this.log("Mousedown on " + selector);
        });
    };
    LocalRuntime.prototype.mouseup = function (selector) {
        return __awaiter(this, void 0, Promise, function* () {
            if (this.chromelessOptions.implicitWait) {
                this.log("mouseup(): Waiting for " + selector);
                yield util_1.waitForNode(this.client, selector, this.chromelessOptions.waitTimeout);
            }
            var exists = yield util_1.nodeExists(this.client, selector);
            if (!exists) {
                throw new Error("mouseup(): node for selector " + selector + " doesn't exist");
            }
            var scale = this.chromelessOptions.viewport.scale;
            yield util_1.mouseup(this.client, selector, scale);
            this.log("Mouseup on " + selector);
        });
    };
    LocalRuntime.prototype.setHtml = function (html) {
        return __awaiter(this, void 0, Promise, function* () {
            yield util_1.setHtml(this.client, html);
        });
    };
    LocalRuntime.prototype.focus = function (selector) {
        return __awaiter(this, void 0, Promise, function* () {
            if (this.chromelessOptions.implicitWait) {
                this.log("focus(): Waiting for " + selector);
                yield util_1.waitForNode(this.client, selector, this.chromelessOptions.waitTimeout);
            }
            var exists = yield util_1.nodeExists(this.client, selector);
            if (!exists) {
                throw new Error("focus(): node for selector " + selector + " doesn't exist");
            }
            yield util_1.focus(this.client, selector);
            this.log("Focus on " + selector);
        });
    };
    LocalRuntime.prototype.type = function (text, selector) {
        return __awaiter(this, void 0, Promise, function* () {
            if (selector) {
                if (this.chromelessOptions.implicitWait) {
                    this.log("type(): Waiting for " + selector);
                    yield util_1.waitForNode(this.client, selector, this.chromelessOptions.waitTimeout);
                }
                var exists_1 = yield util_1.nodeExists(this.client, selector);
                if (!exists_1) {
                    throw new Error("type(): Node not found for selector: " + selector);
                }
            }
            yield util_1.type(this.client, text, selector);
            this.log("Typed " + text + " in " + selector);
        });
    };
    LocalRuntime.prototype.cookies = function (nameOrQuery) {
        return __awaiter(this, void 0, Promise, function* () {
            return yield util_1.getCookies(this.client, nameOrQuery);
        });
    };
    LocalRuntime.prototype.allCookies = function () {
        return __awaiter(this, void 0, Promise, function* () {
            return yield util_1.getAllCookies(this.client);
        });
    };
    LocalRuntime.prototype.setCookies = function (nameOrCookies, value) {
        return __awaiter(this, void 0, Promise, function* () {
            if (typeof nameOrCookies !== 'string' && !value) {
                var cookies = Array.isArray(nameOrCookies)
                    ? nameOrCookies
                    : [nameOrCookies];
                return yield util_1.setCookies(this.client, cookies);
            }
            if (typeof nameOrCookies === 'string' && typeof value === 'string') {
                var fn = function () { return location.href; };
                var url = (yield util_1.evaluate(this.client, "" + fn));
                var cookie = {
                    url: url,
                    name: nameOrCookies,
                    value: value,
                };
                return yield util_1.setCookies(this.client, [cookie]);
            }
            throw new Error("setCookies(): Invalid input " + nameOrCookies + ", " + value);
        });
    };
    LocalRuntime.prototype.deleteCookies = function (name, url) {
        return __awaiter(this, void 0, Promise, function* () {
            var Network = this.client.Network;
            var canClearCookies = yield Network.canClearBrowserCookies();
            if (canClearCookies) {
                yield util_1.deleteCookie(this.client, name, url);
                this.log("Cookie " + name + " cleared");
            }
            else {
                this.log("Cookie " + name + " could not be cleared");
            }
        });
    };
    LocalRuntime.prototype.clearCookies = function () {
        return __awaiter(this, void 0, Promise, function* () {
            var Network = this.client.Network;
            var canClearCookies = yield Network.canClearBrowserCookies();
            if (canClearCookies) {
                yield util_1.clearCookies(this.client);
                this.log('Cookies cleared');
            }
            else {
                this.log('Cookies could not be cleared');
            }
        });
    };
    LocalRuntime.prototype.press = function (keyCode, count, modifiers) {
        return __awaiter(this, void 0, Promise, function* () {
            this.log("Sending keyCode " + keyCode + " (modifiers: " + modifiers + ")");
            yield util_1.press(this.client, keyCode, count, modifiers);
        });
    };
    LocalRuntime.prototype.returnExists = function (selector) {
        return __awaiter(this, void 0, Promise, function* () {
            return yield util_1.nodeExists(this.client, selector);
        });
    };
    LocalRuntime.prototype.returnInputValue = function (selector) {
        return __awaiter(this, void 0, Promise, function* () {
            var exists = yield util_1.nodeExists(this.client, selector);
            if (!exists) {
                throw new Error("value: node for selector " + selector + " doesn't exist");
            }
            return util_1.getValue(this.client, selector);
        });
    };
    // Returns the S3 url or local file path
    LocalRuntime.prototype.returnScreenshot = function (selector, options) {
        return __awaiter(this, void 0, Promise, function* () {
            if (selector) {
                if (this.chromelessOptions.implicitWait) {
                    this.log("screenshot(): Waiting for " + selector);
                    yield util_1.waitForNode(this.client, selector, this.chromelessOptions.waitTimeout);
                }
                var exists_2 = yield util_1.nodeExists(this.client, selector);
                if (!exists_2) {
                    throw new Error("screenshot(): node for selector " + selector + " doesn't exist");
                }
            }
            var data = yield util_1.screenshot(this.client, selector);
            if (util_1.isS3Configured()) {
                return yield util_1.uploadToS3(data, 'image/png');
            }
            else {
                return util_1.writeToFile(data, 'png', options && options.filePath);
            }
        });
    };
    LocalRuntime.prototype.returnHtml = function () {
        return __awaiter(this, void 0, Promise, function* () {
            return yield util_1.html(this.client);
        });
    };
    // Returns the S3 url or local file path
    LocalRuntime.prototype.returnPdf = function (options) {
        return __awaiter(this, void 0, Promise, function* () {
            var filePath = (void 0).filePath;
            cdpOptions;
        });
    };
    LocalRuntime.prototype.if = function (isS3Configured) {
        if (isS3Configured === void 0) { isS3Configured = (); }
        return yield util_1.uploadToS3(data, 'application/pdf');
    };
    return LocalRuntime;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LocalRuntime;
{
    return util_1.writeToFile(data, 'pdf', filePath);
}
async;
util_1.clearInput(selector, string);
Promise < void  > {
    if: function (selector) {
        if (this.chromelessOptions.implicitWait) {
            this.log("clearInput(): Waiting for " + selector);
            yield util_1.waitForNode(this.client, selector, this.chromelessOptions.waitTimeout);
        }
        var exists = yield util_1.nodeExists(this.client, selector);
        if (!exists) {
            throw new Error("clearInput(): Node not found for selector: " + selector);
        }
    },
    await: util_1.clearInput(this.client, selector),
    this: .log(selector + " cleared")
};
async;
util_1.setFileInput(selector, string, files, string[]);
Promise < void  > {
    if: function () { }, this: .chromelessOptions.implicitWait };
{
    this.log("setFileInput(): Waiting for " + selector);
    yield util_1.waitForNode(this.client, selector, this.chromelessOptions.waitTimeout);
}
var exists = yield util_1.nodeExists(this.client, selector);
if (!exists) {
    throw new Error("setFileInput(): node for selector " + selector + " doesn't exist");
}
yield util_1.setFileInput(this.client, selector, files);
this.log("setFileInput() files " + files);
log(msg, string);
void {
    if: function () { }, this: .chromelessOptions.debug };
{
    console.log(msg);
}
//# sourceMappingURL=local-runtime.js.map