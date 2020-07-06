import { substitute } from '../subs'
import { Op, OpInitData, State, Result } from '../op'

// -------------------------------------------
// DEF
// -------------------------------------------
export class OpDef extends Op {
  constructor (args: OpInitData) {
    super('def', args)
  }

  substitute (state: Readonly<State>, strict: boolean): OpDef {
    return new OpDef({
      options: substitute(this.options, state, strict)
    })
  }

  async compile (state: Readonly<State>): Promise<Result> {
    // Upsert these vars into the state
    return [[], Object.assign({}, state, this.options)]
  }
}
