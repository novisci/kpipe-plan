"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const op_1 = require("../op");
const oper_1 = require("../oper");
// -------------------------------------------
const UIDGenerator = require('uid-generator');
const uidgen = new UIDGenerator(32, UIDGenerator.BASE58);
// -------------------------------------------
// STAGE
// -------------------------------------------
class OpStage extends op_1.Op {
    constructor(args) {
        super('stage', args);
    }
    substitute(state, strict) {
        return new OpStage({
            name: this.name,
            options: this.options,
            ops: this.ops.map((o) => o.substitute(state, strict))
        });
    }
    async compile(state) {
        const [cops, ste] = await oper_1.compileOps(this.ops, state);
        return [[new OpStage({
                    name: this.name,
                    options: this.options,
                    ops: cops
                })], ste];
    }
    execute(state) {
        let compiled = [];
        const withState = Object.assign({}, state, {
            stageIdx: typeof state.stageIdx !== 'undefined' ? state.stageIdx + 1 : 0,
            stageUid: uidgen.generateSync(),
            stageName: this.name,
            stepIdx: 0
        });
        this.ops.forEach((o) => {
            const [[...cops]] = oper_1.executeOps([o], withState); // Note: dumps state?
            if (cops.length > 0) {
                compiled = compiled.concat(cops);
            }
            withState.stepIdx++;
        });
        return [compiled, withState];
    }
}
exports.OpStage = OpStage;
//# sourceMappingURL=stage.js.map