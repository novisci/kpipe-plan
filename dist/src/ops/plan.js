"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const op_1 = require("../op");
const oper_1 = require("../oper");
// -------------------------------------------
const UIDGenerator = require('uid-generator');
const uidgen = new UIDGenerator(32, UIDGenerator.BASE58);
// -------------------------------------------
// PLAN
// -------------------------------------------
class OpPlan extends op_1.Op {
    constructor(args) {
        super('plan', args);
    }
    substitute(state, strict) {
        return new OpPlan({
            name: this.name,
            ops: this.ops.map((o) => o.substitute(state, strict))
        });
    }
    compile(state) {
        const [cops, ste] = oper_1.compileOps(this.ops, state);
        return [[new OpPlan({
                    name: this.name,
                    options: this.options,
                    ops: cops
                })], ste];
    }
    execute(state) {
        state = Object.assign(state, {
            planName: this.name,
            planUid: uidgen.generateSync()
        });
        return oper_1.executeOps(this.ops, state);
    }
}
exports.OpPlan = OpPlan;
//# sourceMappingURL=plan.js.map