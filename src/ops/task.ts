import { substitute } from '../subs'
import { taskId, Task } from '../task'
import { Op, OpInitData, State, ExecStepState, ExecTaskState } from '../op'

// -------------------------------------------
const UIDGenerator = require('uid-generator')
const uidgen = new UIDGenerator(32, UIDGenerator.BASE58)

// -------------------------------------------
// TASK
// -------------------------------------------
export class OpTask extends Op {
  constructor (args: OpInitData) {
    super('task', args)
  }

  substitute (state: Readonly<State>, strict: boolean): OpTask {
    return new OpTask({
      name: substitute(this.name, state, strict),
      options: this.options,
      args: substitute(this.args, state, strict)
    })
  }

  execute (state: Readonly<ExecStepState>): [ Task[], ExecStepState ] {
    const withState: ExecTaskState = { ...state, taskUid: uidgen.generateSync() }

    return [
      [{
        taskId: taskId(withState),
        op: 'task',
        cmd: this.name,
        args: this.args
      }],
      withState
    ]
  }
}
