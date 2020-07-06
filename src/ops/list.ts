import { substitute } from '../subs'
import { Op, OpInitData, State, Result } from '../op'
import { compileOps } from '../oper'

// -------------------------------------------
// LIST
// -------------------------------------------
export class OpList extends Op {
  constructor (args: OpInitData) {
    super('list', args)
  }

  substitute (state: Readonly<State>, strict: boolean): OpList {
    // Remove existing "local" var IT
    const listState = { ...state }
    delete listState.IT
    return new OpList({
      options: this.options,
      name: substitute(this.name, listState, strict),
      ops: this.ops.map((o) => o.substitute(listState, strict))
    })
  }

  async compile (state: Readonly<State>): Promise<Result> {
    let compiled: Op[] = []

    const files: string[] = []

    // files.forEach(async (f) => {
    await files.reduce(async (prev, f) => {
      await prev
      const withState = Object.assign({}, state, {
        IT: f
      })
      const [cops] = await compileOps(this.ops, withState) // Note: dumps state?
      if (cops.length > 0) {
        compiled = compiled.concat(cops)
      }
    }, Promise.resolve())

    return [compiled, state]
  }
}
