"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const subs_1 = require("../subs");
const op_1 = require("../op");
const parse_1 = require("../parse");
const oper_1 = require("../oper");
// -------------------------------------------
// INCLUDE
// -------------------------------------------
class OpInclude extends op_1.Op {
    constructor(args) {
        super('include', args);
    }
    substitute(state, strict) {
        return new OpInclude({
            options: subs_1.substitute(this.options, state, strict),
            name: subs_1.substitute(this.name, state, strict)
        });
    }
    compile(state) {
        // Load external json file
        const path = this.name.replace(/\.json$/i, '');
        const ext = JSON.parse(require('fs').readFileSync(`${path}.json`));
        return oper_1.compileOps(parse_1.parseOps(ext), state);
    }
}
exports.OpInclude = OpInclude;
//# sourceMappingURL=include.js.map