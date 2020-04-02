import { Task } from './task'
import { Op, State, Result, ExecResult } from './op'

// -------------------------------------------
export function compileOps (ops: Op[], state: Readonly<State>): Result {
  let compiled: Op[] = []
  let withState: State = state
  ops.forEach((o) => {
    const [cops, ste] = o.substitute(withState, false).compile(withState)
    compiled = compiled.concat(cops)
    withState = ste
    // console.debug(withState)
  })
  return [compiled, withState]
}

// -------------------------------------------
export function executeOps (ops: Op[], state: Readonly<State>): ExecResult {
  let executed: Task[] = []
  let withState = { ...state }
  ops.forEach((o) => {
    const [ops, ste] = o.substitute(withState, true).execute(withState)
    executed = executed.concat(ops)
    withState = ste
  })
  return [executed, withState]
}
