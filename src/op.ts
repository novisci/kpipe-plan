import { Task } from './task'

// -------------------------------------------
const runOpKeywords = ['echo', 'task', 'exec']
const compileOpKeywords = ['spread', 'stage', 'plan']
const macroOpKeywords = ['def', 'seq', 'with', 'include', 'pipeline', 'pipe', 'list']
export const opKeywords = [...runOpKeywords, ...compileOpKeywords, ...macroOpKeywords]

// type Props = { [key: string]: (string | number | string[] | number[] | Op[]) }
export type Props = { [key: string]: any }
export type Result = [ Op[], State ]
export type ExecResult = [ Task[], ExecState ]

// State holds information about the current task step plus
//  a mutable set of plan defined variables
export type State = { [key: string]: (string | number | Props) }

// Execution state matches the plan hierarchy
export type ExecState = State
export interface ExecPlanState extends ExecState {
  planName: string
  planUid: string
}
export interface ExecStageState extends ExecPlanState {
  stageIdx: number
  stageUid: string
  stageName: string
}
export interface ExecStepState extends ExecStageState {
  stepIdx: number
}
export interface ExecTaskState extends ExecStepState {
  taskUid: string
}

// -------------------------------------------
type OpArgData = readonly [string, Props, any[]]
export type OpData = readonly [string, OpArgData]
export type OpInit = readonly [string, OpInitData]

// -------------------------------------------
export type OpInitData = {
  readonly name?: string
  readonly options?: Props
  readonly args?: string[]
  readonly ops?: Op[]
}

// -------------------------------------------
// OP
// -------------------------------------------
export class Op {
  readonly keyword: string
  readonly name: string = ''
  readonly options: Props = {}
  readonly args: string[] = []
  readonly ops: Op[] = []

  constructor (keyword: string, init: OpInitData) {
    this.keyword = keyword
    if (init.name) {
      this.name = init.name
    }
    // console.error(util.inspect(init.options, false, null, true /* enable colors */))

    if (init.options) {
      this.options = init.options
    }
    // console.error(util.inspect(this.options, false, null, true /* enable colors */))
    if (init.args) {
      this.args = [...init.args]
    }
    if (init.ops) {
      this.ops = [...init.ops]
    }
  }

  toJSON (): any[] {
    const data = []
    data.push(this.keyword)
    if (this.name) {
      data.push(this.name)
    } else if (this.options) {
      data.push(this.options)
    }
    if (this.ops.length) {
      const ops: any[] = []
      this.ops.forEach((o: Op) => {
        ops.push(o.toJSON())
      })
      data.push(ops)
    } else if (this.args.length) {
      data.push(this.args)
    }
    return data
  }

  async compile (state: Readonly<State>): Promise<Result> {
    return [[this], state]
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  substitute (state: Readonly<State>, strict: boolean): Op {
    throw Error('substitute() must be defined in Oper derived classes')
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  execute (state: Readonly<ExecState>): ExecResult {
    throw Error(`execute() is undefined for ${this.keyword}`)
  }
}
