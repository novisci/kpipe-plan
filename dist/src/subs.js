"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const expr_eval_1 = require("expr-eval");
const parser = new expr_eval_1.Parser({
    operators: {
        assignment: false
        // // These default to true, but are included to be explicit
        // add: true,
        // concatenate: true,
        // conditional: true,
        // divide: true,
        // factorial: true,
        // multiply: true,
        // power: true,
        // remainder: true,
        // subtract: true,
        // // Disable and, or, not, <, ==, !=, etc.
        // logical: false,
        // comparison: false,
        // // Disable 'in' and = operators
        // 'in': false,
        // assignment: false
    }
});
parser.functions.padZero = (s, p = 5) => {
    if (typeof s !== 'number' && typeof s !== 'string') {
        throw Error(`padZero() argument must be a string or a number`);
    }
    if (typeof p !== 'number') {
        throw Error('padZero() padding must be a number');
    }
    return s.toString().padStart(p, '0');
};
parser.functions.concat = (...args) => {
    args.forEach((a) => {
        if (typeof a !== 'string') {
            throw Error(`concat() accepts only string argments`);
        }
    });
    return ''.concat(...args);
};
// function evaluateExprOld (m: string, vars: any, strict: boolean): string {
//   const v = m.substring(2, m.length - 1)
//   if (typeof vars[v] !== 'undefined') {
//     return vars[v]
//   }
//   if (strict) {
//     throw Error(`Variable "${v} is undefined"`)
//   }
//   return m
// }
function evaluateExpr(m, vars, strict) {
    const tmpl = m.substring(2, m.length - 1);
    const expr = parser.parse(tmpl);
    const simp = expr.simplify(vars);
    let value;
    if (simp.variables().length > 0) {
        if (strict) {
            throw Error(`Undefined variables: ${simp.variables().join(', ')}`);
        }
        // Not all variables were resolved, return the simplified expression
        value = '${' + simp.toString() + '}';
    }
    else {
        value = simp.evaluate();
        // Convert numeric result to string
        if (typeof value === 'number') {
            value = value.toString();
        }
        if (typeof value !== 'string') {
            throw Error(`Unexpected expression result ${value}`);
        }
        if (value.match(/^".*"$/)) {
            value = value.substring(1, value.length - 1);
        }
    }
    // console.debug(`${tmpl} => ${simp.toString()} = ${value}`)
    return value;
}
function substituteString(str, vars, strict = false) {
    const rx = /\${[^{}]*}/g;
    return str.replace(rx, (m) => {
        return evaluateExpr(m, vars, strict);
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
    if (typeof obj === 'object' && obj.constructor === Object) {
        return substituteObject(obj, vars, strict);
    }
    return obj;
}
exports.substitute = substitute;
//# sourceMappingURL=subs.js.map