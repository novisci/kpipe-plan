"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const subs_1 = require("../subs");
const task_1 = require("../task");
const op_1 = require("../op");
// -------------------------------------------
const UIDGenerator = require('uid-generator');
const uidgen = new UIDGenerator(32, UIDGenerator.BASE58);
// -------------------------------------------
// ECHO
// -------------------------------------------
class OpEcho extends op_1.Op {
    constructor(args) {
        super('echo', args);
    }
    substitute(state, strict) {
        return new OpEcho({
            name: subs_1.substitute(this.name, state, strict),
            options: this.options,
            args: this.args
        });
    }
    execute(state) {
        const withState = {
            ...state,
            taskUid: uidgen.generateSync()
        };
        return [
            [{
                    taskId: task_1.taskId(withState),
                    op: 'echo',
                    cmd: this.name,
                    args: []
                }],
            withState
        ];
    }
}
exports.OpEcho = OpEcho;
//# sourceMappingURL=echo.js.map