"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var Queue = (function () {
    function Queue(chrome) {
        this.chrome = chrome;
        this.flushCount = 0;
        this.commandQueue = {
            0: [],
        };
    }
    Queue.prototype.end = function () {
        return __awaiter(this, void 0, Promise, function* () {
            this.lastWaitAll = this.waitAll();
            yield this.lastWaitAll;
            yield this.chrome.close();
        });
    };
    Queue.prototype.enqueue = function (command) {
        this.commandQueue[this.flushCount].push(command);
    };
    Queue.prototype.process = function (command) {
        return __awaiter(this, void 0, Promise, function* () {
            // with lastWaitAll we build a promise chain
            // already change the pointer to lastWaitAll for the next .process() call
            // after the pointer is set, wait for the previous tasks
            // then wait for the own pointer (the new .lastWaitAll)
            if (this.lastWaitAll) {
                var lastWaitAllTmp = this.lastWaitAll;
                this.lastWaitAll = this.waitAll();
                yield lastWaitAllTmp;
            }
            else {
                this.lastWaitAll = this.waitAll();
            }
            yield this.lastWaitAll;
            return this.chrome.process(command);
        });
    };
    Queue.prototype.waitAll = function () {
        return __awaiter(this, void 0, Promise, function* () {
            var previousFlushCount = this.flushCount;
            this.flushCount++;
            this.commandQueue[this.flushCount] = [];
            for (var _i = 0, _a = this.commandQueue[previousFlushCount]; _i < _a.length; _i++) {
                var command = _a[_i];
                yield this.chrome.process(command);
            }
        });
    };
    return Queue;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Queue;
//# sourceMappingURL=queue.js.map