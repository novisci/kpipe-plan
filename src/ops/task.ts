import { substitute } from '../subs'
import { taskId } from '../task'
import { Op, OpInitData, State, ExecResult } from '../op'

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

  execute (state: Readonly<State>): ExecResult {
    const withState = Object.assign({}, state, { taskUid: uidgen.generateSync() })

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
