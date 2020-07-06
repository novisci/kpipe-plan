"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const subs_1 = require("../subs");
const op_1 = require("../op");
const oper_1 = require("../oper");
// -------------------------------------------
// WITH
// -------------------------------------------
class OpWith extends op_1.Op {
    constructor(args) {
        super('with', args);
    }
    substitute(state, strict) {
        return new OpWith({
            name: this.name,
            options: subs_1.substitute(this.options, state, strict),
            ops: this.ops.map((o) => o.substitute(state, strict))
        });
    }
    async compile(state) {
        let compiled = [];
        const hasOpts = Object.values(this.options).length > 0;
        // Validate any supplied loop definitions
        if (hasOpts) {
            Object.values(this.options).map((v) => {
                if (!Array.isArray(v)) {
                    throw Error('with operation expects an options object with only array values');
                }
            });
        }
        // If a name is specified, read it's current value from state
        let loopDef = null;
        if (this.name) {
            loopDef = state[this.name];
        }
        if (!loopDef && !hasOpts) {
            throw Error('Named with operation has undefined label and no loop definition');
        }
        if (!loopDef) {
            loopDef = { ...this.options };
        }
        // console.debug('WITH', loopDef)
        // Determine length of longest array
        const maxIdx = Object.values(loopDef).reduce((a, c) => Math.max(a, c.length), 0);
        // If sub-operations are present, compile them
        if (this.ops.length > 0) {
            let i = 0;
            for (i = 0; i < maxIdx; i++) {
                const withState = Object.assign({}, state);
                Object.entries(loopDef).map((e) => {
                    if (Array.isArray(e[1])) {
                        withState[e[0]] = e[1][i % e[1].length];
                    }
                    else {
                        withState[e[0]] = e[1];
                    }
                });
                const [cops] = await oper_1.compileOps(this.ops, withState); // Note: dumps state?
                if (cops.length > 0) {
                    compiled = compiled.concat(cops);
                }
            }
        }
        // Update the labeled loop definition in the state
        const newState = { ...state };
        if (this.name) {
            newState[this.name] = { ...loopDef };
        }
        return [compiled, newState];
    }
}
exports.OpWith = OpWith;
//# sourceMappingURL=with.js.map