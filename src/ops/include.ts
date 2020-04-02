import { substitute } from '../subs'
import { Op, OpInitData, State, Result } from '../op'
import { parseOps } from '../parse'
import { compileOps } from  '../oper'

// -------------------------------------------
// INCLUDE
// -------------------------------------------
export class OpInclude extends Op {
  constructor (args: OpInitData) {
    super('include', args)
  }

  substitute (state: Readonly<State>, strict: boolean): OpInclude {
    return new OpInclude({
      options: substitute(this.options, state, strict),
      name: substitute(this.name, state, strict)
    })
  }

  compile (state: Readonly<State>): Result {
    // Load external json file
    const path = this.name.replace(/\.json$/i, '')
    const ext = JSON.parse(require('fs').readFileSync(`${path}.json`))

    return compileOps(parseOps(ext), state)
  }
}
