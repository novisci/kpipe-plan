"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const subs_1 = require("../subs");
const task_1 = require("../task");
const op_1 = require("../op");
// -------------------------------------------
const UIDGenerator = require('uid-generator');
const uidgen = new UIDGenerator(32, UIDGenerator.BASE58);
// -------------------------------------------
// EXEC
// -------------------------------------------
class OpExec extends op_1.Op {
    constructor(args) {
        super('exec', args);
    }
    substitute(state, strict) {
        return new OpExec({
            name: subs_1.substitute(this.name, state, strict),
            options: this.options,
            args: subs_1.substitute(this.args, state, strict)
        });
    }
    execute(state) {
        const withState = { ...state, taskUid: uidgen.generateSync() };
        return [
            [{
                    taskId: task_1.taskId(withState),
                    op: 'exec',
                    cmd: this.name,
                    args: this.args
                }],
            withState
        ];
    }
}
exports.OpExec = OpExec;
//# sourceMappingURL=exec.js.map