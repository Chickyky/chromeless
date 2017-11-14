"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var CDP = require('chrome-remote-interface');
var chrome_launcher_1 = require('chrome-launcher');
var local_runtime_1 = require('./local-runtime');
var util_1 = require('../util');
var LocalChrome = (function () {
    function LocalChrome(options) {
        if (options === void 0) { options = {}; }
        this.options = options;
        this.runtimeClientPromise = this.initRuntimeClient();
    }
    LocalChrome.prototype.initRuntimeClient = function () {
        return __awaiter(this, void 0, Promise, function* () {
            var client = this.options.launchChrome
                ? yield this.startChrome()
                : yield this.connectToChrome();
            var _a = this.options.viewport, viewport = _a === void 0 ? {} : _a;
            yield util_1.setViewport(client, viewport);
            var runtime = new local_runtime_1.default(client, this.options);
            return { client: client, runtime: runtime };
        });
    };
    LocalChrome.prototype.startChrome = function () {
        return __awaiter(this, void 0, Promise, function* () {
            this.chromeInstance = yield chrome_launcher_1.launch({
                logLevel: this.options.debug ? 'info' : 'silent',
                port: this.options.cdp.port,
                chromeFlags: this.options.chromeFlags
            });
            var target = yield CDP.New({
                port: this.chromeInstance.port,
            });
            return yield CDP({ target: target });
        });
    };
    LocalChrome.prototype.connectToChrome = function () {
        return __awaiter(this, void 0, Promise, function* () {
            var target = yield CDP.New({
                port: this.options.cdp.port,
                host: this.options.cdp.host,
            });
            return yield CDP({ target: target });
        });
    };
    LocalChrome.prototype.setViewport = function (client) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a = this.options.viewport, viewport = _a === void 0 ? {} : _a;
            var config = {
                deviceScaleFactor: 1,
                mobile: false,
                scale: viewport.scale || 1,
                fitWindow: false,
            };
            var port = this.options.cdp.port;
            var versionResult = yield CDP.Version({ port: port });
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
                config.height = yield util_1.evaluate(client, (function () { return window.innerHeight; }).toString());
                config.width = yield util_1.evaluate(client, (function () { return window.innerWidth; }).toString());
            }
            yield client.Emulation.setDeviceMetricsOverride(config);
            yield client.Emulation.setVisibleSize({
                width: config.width,
                height: config.height,
            });
        });
    };
    LocalChrome.prototype.process = function (command) {
        return __awaiter(this, void 0, Promise, function* () {
            var runtime = (yield this.runtimeClientPromise).runtime;
            return (yield runtime.run(command));
        });
    };
    LocalChrome.prototype.close = function () {
        return __awaiter(this, void 0, Promise, function* () {
            var client = (yield this.runtimeClientPromise).client;
            if (this.options.cdp.closeTab) {
                yield CDP.Close({ id: client.target.id });
            }
            if (this.chromeInstance) {
                this.chromeInstance.kill();
            }
            yield client.close();
        });
    };
    return LocalChrome;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LocalChrome;
//# sourceMappingURL=local.js.map