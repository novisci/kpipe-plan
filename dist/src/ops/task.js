"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const subs_1 = require("../subs");
const task_1 = require("../task");
const op_1 = require("../op");
// -------------------------------------------
const UIDGenerator = require('uid-generator');
const uidgen = new UIDGenerator(32, UIDGenerator.BASE58);
// -------------------------------------------
// TASK
// -------------------------------------------
class OpTask extends op_1.Op {
    constructor(args) {
        super('task', args);
    }
    substitute(state, strict) {
        return new OpTask({
            name: subs_1.substitute(this.name, state, strict),
            options: this.options,
            args: subs_1.substitute(this.args, state, strict)
        });
    }
    execute(state) {
        const withState = Object.assign({}, state, { taskUid: uidgen.generateSync() });
        return [
            [{
                    taskId: task_1.taskId(withState),
                    op: 'task',
                    cmd: this.name,
                    args: this.args
                }],
            withState
        ];
    }
}
exports.OpTask = OpTask;
//# sourceMappingURL=task.js.map