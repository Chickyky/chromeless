import { Client, Cookie, DeviceMetrics, PdfOptions, ScreenshotOptions, BoxModel, Viewport } from './types';
export declare const version: string;
export declare function setViewport(client: Client, viewport?: DeviceMetrics): Promise<void>;
export declare function waitForNode(client: Client, selector: string, waitTimeout: number): Promise<void>;
export declare function wait(timeout: number): Promise<void>;
export declare function nodeExists(client: Client, selector: string): Promise<boolean>;
export declare function getClientRect(client: any, selector: any): Promise<ClientRect>;
export declare function click(client: Client, selector: string, scale: number): Promise<void>;
export declare function focus(client: Client, selector: string): Promise<void>;
export declare function evaluate<T>(client: Client, fn: string, ...args: any[]): Promise<T>;
export declare function type(client: Client, text: string, selector?: string): Promise<void>;
export declare function press(client: Client, keyCode: number, count?: number, modifiers?: any): Promise<void>;
export declare function getValue(client: Client, selector: string): Promise<string>;
export declare function scrollTo(client: Client, x: number, y: number): Promise<void>;
export declare function scrollToElement(client: Client, selector: string): Promise<void>;
export declare function setHtml(client: Client, html: string): Promise<void>;
export declare function getCookies(client: Client, nameOrQuery?: string | Cookie): Promise<any>;
export declare function getAllCookies(client: Client): Promise<any>;
export declare function setCookies(client: Client, cookies: Cookie[]): Promise<void>;
export declare function setExtraHTTPHeaders(client: Client, headers: Headers): Promise<void>;
export declare function mousedown(client: Client, selector: string, scale: number): Promise<void>;
export declare function mouseup(client: Client, selector: string, scale: number): Promise<void>;
export declare function deleteCookie(client: Client, name: string, url: string): Promise<void>;
export declare function clearCookies(client: Client): Promise<void>;
export declare function getBoxModel(client: Client, selector: string): Promise<BoxModel>;
export declare function boxModelToViewPort(model: BoxModel, scale: number): Viewport;
export declare function screenshot(client: Client, selector: string): Promise<string>;
export declare function html(client: Client): Promise<string>;
export declare function pdf(client: Client, options?: PdfOptions): Promise<string>;
export declare function clearInput(client: Client, selector: string): Promise<void>;
export declare function setFileInput(client: Client, selector: string, files: string[]): Promise<string>;
export declare function getDebugOption(): boolean;
export declare function writeToFile(data: string, extension: string, filePathOverride: string): string;
export declare function writeToFile2(client: Client, data: string, extension: string, options: ScreenshotOptions): Promise<string>;
export declare function isS3Configured(): string;
export declare function uploadToS3(data: string, contentType: string): Promise<string>;
