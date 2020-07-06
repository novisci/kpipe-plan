import { Op, OpInitData, State, Result, ExecResult } from '../op'
import { compileOps, executeOps } from '../oper'

// -------------------------------------------
// SPREAD
// -------------------------------------------
export class OpSpread extends Op {
  constructor (args: OpInitData) {
    super('spread', args)
  }

  substitute (state: Readonly<State>, strict: boolean): OpSpread {
    return new OpSpread({
      name: this.name,
      options: this.options,
      ops: this.ops.map((o) => o.substitute(state, strict))
    })
  }

  async compile (state: Readonly<State>): Promise<Result> {
    const [cops, ste] = await compileOps(this.ops, state)
    return [[new OpSpread({
      name: this.name,
      options: this.options,
      ops: cops
    })], ste]
  }

  execute (state: Readonly<State>): ExecResult {
    // Spread generates ops with a shared stepIdx
    return executeOps(this.ops, state)
  }
}
