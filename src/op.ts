import { Task } from './task'

// -------------------------------------------
const runOpKeywords = ['echo', 'task', 'exec']
const compileOpKeywords = ['spread', 'stage', 'plan']
const macroOpKeywords = ['def', 'seq', 'with', 'include', 'pipeline', 'pipe']
export const opKeywords = [...runOpKeywords, ...compileOpKeywords, ...macroOpKeywords]

// type Props = { [key: string]: (string | number | string[] | number[] | Op[]) }
export type Props = { [key: string]: any }
export type State = { [key: string]: (string | number | Props) }
export type Result = [ Op[], State ]
export type ExecResult = [ Task[], State ]

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
  execute (state: Readonly<State>): ExecResult {
    throw Error(`execute() is undefined for ${this.keyword}`)
  }
}
