"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const subs_1 = require("../subs");
const op_1 = require("../op");
const oper_1 = require("../oper");
// -------------------------------------------
// PIPE
// -------------------------------------------
class OpPipe extends op_1.Op {
    constructor(args) {
        super('pipe', args);
    }
    substitute(state, strict) {
        return new OpPipe({
            options: subs_1.substitute(this.options, state, strict),
            name: subs_1.substitute(this.name, state, strict),
            ops: this.ops.map((o) => o.substitute(state, strict))
        });
    }
    compile(state) {
        const [cops, ste] = oper_1.compileOps(this.ops, state);
        // console.error(util.inspect(cops, false, null, true /* enable colors */))
        // console.error(util.inspect(this.options, false, null, true /* enable colors */))
        return [[new OpPipe({
                    name: this.name,
                    options: this.options,
                    ops: cops
                })], ste];
    }
}
exports.OpPipe = OpPipe;
//# sourceMappingURL=pipe.js.map