"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const op_1 = require("../op");
const oper_1 = require("../oper");
// -------------------------------------------
// SPREAD
// -------------------------------------------
class OpSpread extends op_1.Op {
    constructor(args) {
        super('spread', args);
    }
    substitute(state, strict) {
        return new OpSpread({
            name: this.name,
            options: this.options,
            ops: this.ops.map((o) => o.substitute(state, strict))
        });
    }
    async compile(state) {
        const [cops, ste] = await oper_1.compileOps(this.ops, state);
        return [[new OpSpread({
                    name: this.name,
                    options: this.options,
                    ops: cops
                })], ste];
    }
    execute(state) {
        // Spread generates ops with a shared stepIdx
        return oper_1.executeOps(this.ops, state);
    }
}
exports.OpSpread = OpSpread;
//# sourceMappingURL=spread.js.map