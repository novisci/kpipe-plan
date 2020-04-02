import { substitute } from '../subs'
import { Op, OpInitData, State, Result, Props } from '../op'
import { compileOps } from  '../oper'

// -------------------------------------------
// WITH
// -------------------------------------------
export class OpWith extends Op {
  constructor (args: OpInitData) {
    super('with', args)
  }

  substitute (state: Readonly<State>, strict: boolean): OpWith {
    return new OpWith({
      name: this.name,
      options: substitute(this.options, state, strict),
      ops: this.ops.map((o) => o.substitute(state, strict))
    })
  }

  compile (state: Readonly<State>): Result {
    let compiled: Op[] = []
    const hasOpts = Object.values(this.options).length > 0

    // Validate any supplied loop definitions
    if (hasOpts) {
      Object.values(this.options).map((v) => {
        if (!Array.isArray(v)) {
          throw Error('with operation expects an options object with only array values')
        }
      })
    }

    // If a name is specified, read it's current value from state
    let loopDef: Props | null = null
    if (this.name) {
      loopDef = state[this.name] as Props
    }

    if (!loopDef && !hasOpts) {
      throw Error('Named with operation has undefined label and no loop definition')
    }

    if (!loopDef) {
      loopDef = this.options
    }

    // console.debug('WITH', loopDef)

    // Determine length of longest array
    const maxIdx = Object.values(loopDef).reduce((a: number, c) => Math.max(a, (c as unknown[]).length), 0)

    // If sub-operations are present, compile them
    if (this.ops.length > 0) {
      let i = 0
      for (i = 0; i < maxIdx; i++) {
        const withState: State = Object.assign({}, state)
        Object.entries(loopDef).map((e) => {
          if (Array.isArray(e[1])) {
            withState[e[0]] = e[1][i % e[1].length]
          } else {
            withState[e[0]] = e[1]
          }
        })
        const [cops] = compileOps(this.ops, withState) // Note: dumps state?
        if (cops.length > 0) {
          compiled = compiled.concat(cops)
        }
      }
    }

    // Update the labeled loop definition in the state
    const newState = { ...state }
    if (this.name) {
      newState[this.name] = { ...loopDef }
    }

    return [compiled, newState]
  }
}
