"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
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
var Queue = (function () {
    function Queue(chrome) {
        this.chrome = chrome;
        this.flushCount = 0;
        this.commandQueue = {
            0: []
        };
    }
    Queue.prototype.end = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.lastWaitAll = this.waitAll();
                        return [4 /*yield*/, this.lastWaitAll];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.chrome.close()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Queue.prototype.enqueue = function (command) {
        this.commandQueue[this.flushCount].push(command);
    };
    Queue.prototype.process = function (command) {
        return __awaiter(this, void 0, void 0, function () {
            var lastWaitAllTmp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.lastWaitAll) return [3 /*break*/, 2];
                        lastWaitAllTmp = this.lastWaitAll;
                        this.lastWaitAll = this.waitAll();
                        return [4 /*yield*/, lastWaitAllTmp];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        this.lastWaitAll = this.waitAll();
                        _a.label = 3;
                    case 3: return [4 /*yield*/, this.lastWaitAll];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, this.chrome.process(command)];
                }
            });
        });
    };
    Queue.prototype.waitAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            var previousFlushCount, _i, _a, command;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        previousFlushCount = this.flushCount;
                        this.flushCount++;
                        this.commandQueue[this.flushCount] = [];
                        _i = 0, _a = this.commandQueue[previousFlushCount];
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        command = _a[_i];
                        return [4 /*yield*/, this.chrome.process(command)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return Queue;
}());
exports.__esModule = true;
exports["default"] = Queue;