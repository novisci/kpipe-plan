import { Op, OpInitData, State, Result, ExecResult } from '../op'
import { executeOps, compileOps } from  '../oper'

// -------------------------------------------
const UIDGenerator = require('uid-generator')
const uidgen = new UIDGenerator(32, UIDGenerator.BASE58)

// -------------------------------------------
// PLAN
// -------------------------------------------
export class OpPlan extends Op {
  constructor (args: OpInitData) {
    super('plan', args)
  }

  substitute (state: Readonly<State>, strict: boolean): OpPlan {
    return new OpPlan({
      name: this.name,
      ops: this.ops.map((o) => o.substitute(state, strict))
    })
  }

  compile (state: Readonly<State>): Result {
    const [cops, ste] = compileOps(this.ops, state)
    return [[new OpPlan({
      name: this.name,
      options: this.options,
      ops: cops
    })], ste]
  }

  execute (state: Readonly<State>): ExecResult {
    state = Object.assign(state, {
      planName: this.name,
      planUid: uidgen.generateSync()
    })

    return executeOps(this.ops, state)
  }
}
