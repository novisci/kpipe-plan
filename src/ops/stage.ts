import { Op, OpInitData, State, Result, ExecPlanState, ExecStageState, ExecStepState } from '../op'
import { compileOps, executeOps } from '../oper'
import { Task } from '../task'

// -------------------------------------------
const UIDGenerator = require('uid-generator')
const uidgen = new UIDGenerator(32, UIDGenerator.BASE58)

// -------------------------------------------
// STAGE
// -------------------------------------------
export class OpStage extends Op {
  constructor (args: OpInitData) {
    super('stage', args)
  }

  substitute (state: Readonly<State>, strict: boolean): OpStage {
    return new OpStage({
      name: this.name,
      options: this.options,
      ops: this.ops.map((o) => o.substitute(state, strict))
    })
  }

  async compile (state: Readonly<State>): Promise<Result> {
    const [cops, ste] = await compileOps(this.ops, state)
    return [[new OpStage({
      name: this.name,
      options: this.options,
      ops: cops
    })], ste]
  }

  execute (state: Readonly<ExecPlanState>): [ Task[], ExecPlanState ] {
    let compiled: Task[] = []

    const withState: ExecStageState = {
      ...state,
      stageIdx: typeof state.stageIdx !== 'undefined' ? state.stageIdx as number + 1 : 0,
      stageUid: uidgen.generateSync(),
      stageName: this.name
      // stepIdx: 0
    }

    let stepIdx = 0
    this.ops.forEach((o) => {
      const stepState: ExecStepState = {
        ...withState,
        stepIdx
      }
      const [[...cops]] = executeOps([o], stepState) // Note: dumps state?
      if (cops.length > 0) {
        compiled = compiled.concat(cops)
      }
      stepIdx++
    })

    return [compiled, withState]
  }
}
