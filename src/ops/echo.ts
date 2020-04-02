import { substitute } from '../subs'
import { taskId } from '../task'
import { Op, OpInitData, State, ExecResult } from '../op'

// -------------------------------------------
const UIDGenerator = require('uid-generator')
const uidgen = new UIDGenerator(32, UIDGenerator.BASE58)

// -------------------------------------------
// ECHO
// -------------------------------------------
export class OpEcho extends Op {
  constructor (args: OpInitData) {
    super('echo', args)
  }

  substitute (state: Readonly<State>, strict: boolean): OpEcho {
    return new OpEcho({
      name: substitute(this.name, state, strict),
      options: this.options,
      args: this.args
    })
  }

  execute (state: Readonly<State>): ExecResult {
    const withState = Object.assign({}, state, { taskUid: uidgen.generateSync() })

    return [
      [{
        taskId: taskId(withState),
        op: 'echo',
        cmd: this.name,
        args: []
      }],
      withState
    ]
  }
}
