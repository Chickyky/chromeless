"use strict";
var _this = this;
var local_1 = require('./chrome/local');
var remote_1 = require('./chrome/remote');
var queue_1 = require('./queue');
var util_1 = require('./util');
var util_2 = require('util');
var Chromeless = (function () {
    function Chromeless(options, copyInstance) {
        if (options === void 0) { options = {}; }
        this.chrome = mergedOptions.remote
            ? new remote_1.default(mergedOptions)
            : new local_1.default(mergedOptions);
        if (copyInstance) {
            this.queue = copyInstance.queue;
            this.lastReturnPromise = copyInstance.lastReturnPromise;
            return;
        }
        var mergedOptions = {
            debug: util_1.getDebugOption(),
            waitTimeout: 10000,
            remote: false,
            implicitWait: true,
            scrollBeforeClick: false,
            launchChrome: true, };
        options,
            viewport;
        {
            scale: 1,
            ;
            options.viewport,
            ;
        }
        cdp: {
            host: process.env['CHROMELESS_CHROME_HOST'] || 'localhost',
                port;
            parseInt(process.env['CHROMELESS_CHROME_PORT'], 10) || 9222,
                secure;
            false,
                closeTab;
            true,
            ;
            options.cdp,
            ;
        }
    }
    return Chromeless;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Chromeless;
this.queue = new queue_1.default(chrome);
this.lastReturnPromise = Promise.resolve(undefined);
/*
 * The following 3 members are needed to implement a Promise
 */
readonly[Symbol.toStringTag];
'Promise';
then(onFulfill ?  : (function (value) { return U | PromiseLike() | null; },
    onReject ?  : (function (error) { return U | PromiseLike() | null; },
    )), Promise < U > {
    return: this.lastReturnPromise.then(onFulfill, onReject)
});
try {
}
catch () { }
(function (onrejected) {
    return _this.lastReturnPromise.catch(onrejected);
});
goto(url, string);
Chromeless < T > {
    this: .queue.enqueue({ type: 'goto', url: url }),
    return: this
};
setUserAgent(useragent, string);
Chromeless < T > {
    this: .queue.enqueue({ type: 'setUserAgent', useragent: useragent }),
    return: this
};
click(selector, string);
Chromeless < T > {
    this: .queue.enqueue({ type: 'click', selector: selector }),
    return: this
};
wait(timeout, number);
Chromeless < T >
    wait(selector, string, timeout ?  : number);
Chromeless < T >
    wait.apply(void 0, [fn, function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return boolean;
    }].concat(args, [any[]]));
Chromeless < T >
    wait.apply(void 0, [firstArg].concat(args, [any[]]));
Chromeless < T > {
    switch: function () { }, typeof: firstArg };
{
    'number';
    {
        this.queue.enqueue({ type: 'wait', timeout: firstArg });
        break;
    }
    'string';
    {
        this.queue.enqueue({ type: 'wait', selector: firstArg, timeout: args[0] });
        break;
    }
    'function';
    {
        this.queue.enqueue({ type: 'wait', fn: firstArg, args: args });
        break;
    }
    throw new Error("Invalid wait arguments: " + firstArg + " " + args);
}
return this;
clearCache();
Chromeless < T > {
    this: .queue.enqueue({ type: 'clearCache' }),
    return: this
};
focus(selector, string);
Chromeless < T > {
    this: .queue.enqueue({ type: 'focus', selector: selector }),
    return: this
};
press(keyCode, number, count ?  : number, modifiers ?  : any);
Chromeless < T > {
    this: .queue.enqueue({ type: 'press', keyCode: keyCode, count: count, modifiers: modifiers }),
    return: this
};
type(input, string, selector ?  : string);
Chromeless < T > {
    this: .queue.enqueue({ type: 'type', input: input, selector: selector }),
    return: this
};
back();
Chromeless < T > {
    throw: new Error('Not implemented yet')
};
forward();
Chromeless < T > {
    throw: new Error('Not implemented yet')
};
refresh();
Chromeless < T > {
    throw: new Error('Not implemented yet')
};
mousedown(selector, string);
Chromeless < T > {
    this: .queue.enqueue({ type: 'mousedown', selector: selector }),
    return: this
};
mouseup(selector, string);
Chromeless < T > {
    this: .queue.enqueue({ type: 'mouseup', selector: selector }),
    return: this
};
mouseover();
Chromeless < T > {
    throw: new Error('Not implemented yet')
};
scrollTo(x, number, y, number);
Chromeless < T > {
    this: .queue.enqueue({ type: 'scrollTo', x: x, y: y }),
    return: this
};
scrollToElement(selector, string);
Chromeless < T > {
    this: .queue.enqueue({ type: 'scrollToElement', selector: selector }),
    return: this
};
setViewport(options, DeviceMetrics);
Chromeless < T > {
    this: .queue.enqueue({ type: 'setViewport', options: options }),
    return: this
};
setHtml(html, string);
Chromeless < T > {
    this: .queue.enqueue({ type: 'setHtml', html: html }),
    return: this
};
setExtraHTTPHeaders(headers, Headers);
Chromeless < T > {
    this: .queue.enqueue({ type: 'setExtraHTTPHeaders', headers: headers }),
    return: this
};
evaluate.apply(void 0, [fn, function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
    }
    return void ;
}].concat(args, [any[]]));
Chromeless < U > {
    this: .lastReturnPromise = this.queue.process({
        type: 'returnCode',
        fn: fn.toString(),
        args: args,
    }),
    return: new Chromeless({}, this)
};
inputValue(selector, string);
Chromeless < string > {
    this: .lastReturnPromise = this.queue.process({
        type: 'returnInputValue',
        selector: selector,
    }),
    return: new Chromeless({}, this)
};
exists(selector, string);
Chromeless < boolean > {
    this: .lastReturnPromise = this.queue.process({
        type: 'returnExists',
        selector: selector,
    }),
    return: new Chromeless({}, this)
};
screenshot(selector ?  : string, options ?  : ScreenshotOptions);
Chromeless < string > {
    if: function () { }, typeof: selector === 'object' };
{
    options = selector;
    selector = undefined;
}
this.lastReturnPromise = this.queue.process({
    type: 'returnScreenshot',
    selector: selector,
    options: options,
});
return new Chromeless({}, this);
html();
Chromeless < string > {
    this: .lastReturnPromise = this.queue.process({ type: 'returnHtml' }),
    return: new Chromeless({}, this)
};
pdf(options ?  : PdfOptions);
Chromeless < string > {
    this: .lastReturnPromise = this.queue.process({
        type: 'returnPdf',
        options: options,
    }),
    return: new Chromeless({}, this)
};
/**
 * Get the cookies for the current url
 */
cookies();
Chromeless < Cookie[] | null >
    /**
     * Get a specific cookie for the current url
     * @param name
     */
    cookies(name, string);
Chromeless < Cookie | null >
    /**
     * Get a specific cookie by query. Not implemented yet
     * @param query
     */
    cookies(query, CookieQuery);
Chromeless < Cookie[] | null >
    cookies(nameOrQuery ?  : string | CookieQuery);
Chromeless < Cookie | Cookie[] | null > {
    if: function () { }, typeof: nameOrQuery !== 'undefined' && typeof nameOrQuery !== 'string' };
{
    throw new Error('Querying cookies is not implemented yet');
}
this.lastReturnPromise = this.queue.process < Cookie[] | Cookie | null > ({
    type: 'cookies',
    nameOrQuery: nameOrQuery,
});
return new Chromeless < types_1.Cookie | types_1.Cookie[] | null > ({}, this);
allCookies();
Chromeless < Cookie[] > {
    this: .lastReturnPromise = this.queue.process({
        type: 'allCookies',
    }),
    return: new Chromeless({}, this)
};
setCookies(name, string, value, string);
Chromeless < T >
    setCookies(cookie, Cookie);
Chromeless < T >
    setCookies(cookies, Cookie[]);
Chromeless < T >
    setCookies(nameOrCookies, value ?  : string);
Chromeless < T > {
    this: .queue.enqueue({ type: 'setCookies', nameOrCookies: nameOrCookies, value: value }),
    return: this
};
deleteCookies(name, string, url, string);
Chromeless < T > {
    if: function () { }, typeof: name === 'undefined' };
{
    throw new Error('Cookie name should be defined.');
}
if (typeof url === 'undefined') {
    throw new Error('Cookie url should be defined.');
}
this.queue.enqueue({ type: 'deleteCookies', name: name, url: url });
return this;
clearCookies();
Chromeless < T > {
    this: .queue.enqueue({ type: 'clearCookies' }),
    return: this
};
clearInput(selector, string);
Chromeless < T > {
    this: .queue.enqueue({ type: 'clearInput', selector: selector }),
    return: this
};
setFileInput(selector, string, files, string);
Chromeless < T >
    setFileInput(selector, string, files, string[]);
Chromeless < T >
    setFileInput(selector, string, files, string | string[]);
Chromeless < T > {
    if: function () { } };
!util_2.isArray(files);
{
    files = [files];
}
this.queue.enqueue({ type: 'setFileInput', selector: selector, files: files });
return this;
async;
end();
Promise < T > {
    const: result = await, this: .lastReturnPromise,
    await: this.queue.end(),
    return: result
};
//# sourceMappingURL=api.js.map