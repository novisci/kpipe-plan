import { substitute } from '../subs'
import { Op, OpInitData, State, Result } from '../op'
import { compileOps } from '../oper'

// -------------------------------------------
// PIPE
// -------------------------------------------
export class OpPipe extends Op {
  constructor (args: OpInitData) {
    super('pipe', args)
  }

  substitute (state: Readonly<State>, strict: boolean): OpPipe {
    return new OpPipe({
      options: substitute(this.options, state, strict),
      name: substitute(this.name, state, strict),
      ops: this.ops.map((o) => o.substitute(state, strict))
    })
  }

  async compile (state: Readonly<State>): Promise<Result> {
    const [cops, ste] = await compileOps(this.ops, state)
    // console.error(util.inspect(cops, false, null, true /* enable colors */))
    // console.error(util.inspect(this.options, false, null, true /* enable colors */))
    return [[new OpPipe({
      name: this.name,
      options: this.options,
      ops: cops
    })], ste]
  }
}
