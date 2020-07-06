"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const subs_1 = require("../subs");
const op_1 = require("../op");
// -------------------------------------------
// DEF
// -------------------------------------------
class OpDef extends op_1.Op {
    constructor(args) {
        super('def', args);
    }
    substitute(state, strict) {
        return new OpDef({
            options: subs_1.substitute(this.options, state, strict)
        });
    }
    async compile(state) {
        // Upsert these vars into the state
        return [[], Object.assign({}, state, this.options)];
    }
}
exports.OpDef = OpDef;
//# sourceMappingURL=def.js.map