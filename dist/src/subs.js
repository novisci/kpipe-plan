"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function substituteString(str, vars, strict = false) {
    const rx = /\${[^{}]*}/g;
    return str.replace(rx, (m) => {
        const v = m.substring(2, m.length - 1);
        if (typeof vars[v] !== 'undefined') {
            return vars[v];
        }
        if (strict) {
            throw Error(`Variable "$v" is undefined`);
        }
        return m;
    });
}
function substituteObject(obj, vars, strict = false) {
    const sobj = {};
    Object.entries(obj).map((o) => {
        sobj[o[0]] = substitute(o[1], vars, strict);
    });
    return sobj;
}
function substitute(obj, vars, strict = false) {
    if (typeof obj === 'string') {
        return substituteString(obj, vars, strict);
    }
    if (Array.isArray(obj)) {
        return obj.map((a) => substitute(a, vars, strict));
    }
    if (typeof obj === 'object') {
        return substituteObject(obj, vars, strict);
    }
    return obj;
}
exports.substitute = substitute;
//# sourceMappingURL=subs.js.map