import { Task } from './task'
import { Op, State, ExecState, ExecPlanState, ExecStageState, ExecStepState, ExecTaskState, Result, ExecResult } from './op'

// -------------------------------------------
export async function compileOps (ops: Op[], state: Readonly<State>): Promise<Result> {
  let compiled: Op[] = []
  let withState: State = state
  await ops.reduce(async (prev, o) => {
    await prev
    const [cops, ste] = await o.substitute(withState, false).compile(withState)
    compiled = compiled.concat(cops)
    withState = ste
    // console.debug(withState)
  }, Promise.resolve())
  return [compiled, withState]
}

// -------------------------------------------
export function executeOps (ops: Op[], state: Readonly<ExecTaskState>): [ Task[], ExecTaskState ]
export function executeOps (ops: Op[], state: Readonly<ExecStepState>): [ Task[], ExecStepState ]
export function executeOps (ops: Op[], state: Readonly<ExecStageState>): [ Task[], ExecStageState ]
export function executeOps (ops: Op[], state: Readonly<ExecPlanState>): [ Task[], ExecPlanState ]
export function executeOps (ops: Op[], state: Readonly<ExecState>): ExecResult {
  let executed: Task[] = []
  let withState: ExecState = { ...state }
  ops.forEach((o) => {
    const [ops, ste] = o.substitute(withState, true).execute(withState)
    executed = executed.concat(ops)
    withState = ste
  })
  return [executed, withState]
}
