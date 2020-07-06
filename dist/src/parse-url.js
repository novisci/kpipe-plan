"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function safeMatch(url, regex, na = null) {
    const m = url.match(regex);
    if (!m) {
        return na;
    }
    return m[1];
}
// const first = (arr) => arr[0]
const last = (arr) => arr[arr.length - 1];
const protocol = (url) => safeMatch(url, /^([^:]+):\/\//);
const path = (url) => safeMatch(url, /^[^:]+:\/\/(.*)$/);
const pathcomps = (url) => (path(url) || '').split('/');
const prefixes = (url) => pathcomps(url).slice(0, -1);
const extension = (url) => safeMatch(url, /\.([^/.]+)$/);
const isAbsolute = (url) => pathcomps(url)[0] === '';
const isDir = (url) => last(pathcomps(url)) === '';
const file = (url) => last(pathcomps(url)) || null;
function default_1(url) {
    return {
        protocol: protocol(url),
        path: pathcomps(url),
        prefixes: prefixes(url),
        file: file(url),
        extension: extension(url),
        isAbsolute: isAbsolute(url),
        isDir: isDir(url)
    };
}
exports.default = default_1;
//# sourceMappingURL=parse-url.js.map