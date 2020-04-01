import { substitute } from './subs'
import { taskId, Task } from './task'
import * as util from 'util'

// -------------------------------------------
const runOpKeywords = ['echo', 'task', 'exec']
const compileOpKeywords = ['spread', 'stage', 'plan']
const macroOpKeywords = ['def', 'seq', 'with', 'include', 'pipeline', 'pipe']
export const opKeywords = [...runOpKeywords, ...compileOpKeywords, ...macroOpKeywords]

// type Props = { [key: string]: (string | number | string[] | number[] | Op[]) }
type Props = { [key: string]: any }
type State = { [key: string]: (string | number | Props) }
type Result = [ Op[], State ]
type ExecResult = [ Task[], State ]

// -------------------------------------------
type OpArgData = readonly [string, Props, any[]]
type OpData = readonly [string, OpArgData]
type OpInit = readonly [string, OpInitData]

// -------------------------------------------
type OpInitData = {
  readonly name?: string
  readonly options?: Props
  readonly args?: string[]
  readonly ops?: Op[]
}

// -------------------------------------------
const UIDGenerator = require('uid-generator')
const uidgen = new UIDGenerator(32, UIDGenerator.BASE58)

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

  compile (state: Readonly<State>): Result {
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

// -------------------------------------------
function parseLeafArgs (d: OpData): OpInit {
  return [d[0], {
    name: d[1][0],
    options: d[1][1],
    args: d[1][2]
  }]
}

function parseNodeArgs (d: OpData): OpInit {
  return [d[0], {
    name: d[1][0],
    options: d[1][1],
    ops: parseOps(d[1][2])
  }]
}

function parsePipeArgs (d: OpData): OpInit {
  const options = { ...d[1][1] }
  if (options.pre) {
    options.pre = parseOps(options.pre)
  }
  if (options.post) {
    options.post = parseOps(options.post)
  }
  // console.error(util.inspect(options, false, null, true /* enable colors */))

  return [d[0], {
    name: d[1][0],
    options,
    ops: parseOps(d[1][2])
  }]
}

function parseOpInit (d: OpData): OpInit {
  switch (d[0]) {
    case 'echo': return parseLeafArgs(d)
    case 'task': return parseLeafArgs(d)
    case 'exec': return parseLeafArgs(d)
    case 'spread': return parseNodeArgs(d)
    case 'stage': return parseNodeArgs(d)
    case 'plan': return parseNodeArgs(d)
    case 'def': return parseLeafArgs(d)
    case 'seq': return parseNodeArgs(d)
    case 'with': return parseNodeArgs(d)
    case 'include': return parseNodeArgs(d)
    case 'pipeline': return parseNodeArgs(d)
    case 'pipe': return parsePipeArgs(d)
    default:
      throw Error(`Unknown keyword "${d[0]}" in parseOpInit`)
  }
}

function createOp (d: OpInit): Op {
  switch (d[0]) {
    case 'echo': return new OpEcho(d[1])
    case 'task': return new OpTask(d[1])
    case 'exec': return new OpExec(d[1])
    case 'spread': return new OpSpread(d[1])
    case 'stage': return new OpStage(d[1])
    case 'plan': return new OpPlan(d[1])
    case 'def': return new OpDef(d[1])
    case 'seq': return new OpSeq(d[1])
    case 'with': return new OpWith(d[1])
    case 'include': return new OpInclude(d[1])
    case 'pipeline': return new OpPipeline(d[1])
    case 'pipe': return new OpPipe(d[1])
    default:
      throw Error(`Unknown keyword "${d[0]}" in parseOpInit`)
  }
}

export function parseOps (data: any[]): Op[] {
  return data.map((d) => createOp(parseOpInit(preParse(d))))
}

// -------------------------------------------
// ECHO
// -------------------------------------------
class OpEcho extends Op {
  constructor (args: OpInitData) {
    super('echo', args)
  }

  substitute (state: Readonly<State>, strict: boolean): OpEcho {
    return new OpEcho({
      name: substitute(this.name, state, strict),
      options: this.options,
      args: this.args
    })
  }

  execute (state: Readonly<State>): ExecResult {
    const withState = Object.assign({}, state, { taskUid: uidgen.generateSync() })

    return [
      [{
        taskId: taskId(withState),
        op: 'echo',
        cmd: this.name,
        args: []
      }],
      withState
    ]
  }
}

// -------------------------------------------
// TASK
// -------------------------------------------
class OpTask extends Op {
  constructor (args: OpInitData) {
    super('task', args)
  }

  substitute (state: Readonly<State>, strict: boolean): OpTask {
    return new OpTask({
      name: substitute(this.name, state, strict),
      options: this.options,
      args: substitute(this.args, state, strict)
    })
  }

  execute (state: Readonly<State>): ExecResult {
    const withState = Object.assign({}, state, { taskUid: uidgen.generateSync() })

    return [
      [{
        taskId: taskId(withState),
        op: 'task',
        cmd: this.name,
        args: this.args
      }],
      withState
    ]
  }
}

// -------------------------------------------
// EXEC
// -------------------------------------------
class OpExec extends Op {
  constructor (args: OpInitData) {
    super('exec', args)
  }

  substitute (state: Readonly<State>, strict: boolean): OpExec {
    return new OpExec({
      name: substitute(this.name, state, strict),
      options: this.options,
      args: substitute(this.args, state, strict)
    })
  }

  execute (state: Readonly<State>): ExecResult {
    const withState = Object.assign({}, state, { taskUid: uidgen.generateSync() })

    return [
      [{
        taskId: taskId(withState),
        op: 'exec',
        cmd: this.name,
        args: this.args
      }],
      withState
    ]
  }
}

// -------------------------------------------
// SPREAD
// -------------------------------------------
class OpSpread extends Op {
  constructor (args: OpInitData) {
    super('spread', args)
  }

  substitute (state: Readonly<State>, strict: boolean): OpSpread {
    return new OpSpread({
      name: this.name,
      options: this.options,
      ops: this.ops.map((o) => o.substitute(state, strict))
    })
  }

  compile (state: Readonly<State>): Result {
    const [cops, ste] = compileOps(this.ops, state)
    return [[new OpSpread({
      name: this.name,
      options: this.options,
      ops: cops
    })], ste]
  }

  execute (state: Readonly<State>): ExecResult {
    // Spread generates ops with a shared stepIdx
    return executeOps(this.ops, state)
  }
}

// -------------------------------------------
// STAGE
// -------------------------------------------
class OpStage extends Op {
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

  compile (state: Readonly<State>): Result {
    const [cops, ste] = compileOps(this.ops, state)
    return [[new OpStage({
      name: this.name,
      options: this.options,
      ops: cops
    })], ste]
  }

  execute (state: Readonly<State>): ExecResult {
    let compiled: Task[] = []

    const withState = Object.assign({}, state, {
      stageIdx: typeof state.stageIdx !== 'undefined' ? state.stageIdx as number + 1 : 0,
      stageUid: uidgen.generateSync(),
      stageName: this.name,
      stepIdx: 0
    })

    this.ops.forEach((o) => {
      const [[...cops]] = executeOps([o], withState) // Note: dumps state?
      if (cops.length > 0) {
        compiled = compiled.concat(cops)
      }
      withState.stepIdx++
    })

    return [compiled, withState]
  }
}

// -------------------------------------------
// PLAN
// -------------------------------------------
class OpPlan extends Op {
  constructor (args: OpInitData) {
    super('plan', args)
  }

  substitute (state: Readonly<State>, strict: boolean): OpPlan {
    return new OpPlan({
      name: this.name,
      ops: this.ops.map((o) => o.substitute(state, strict))
    })
  }

  compile (state: Readonly<State>): Result {
    const [cops, ste] = compileOps(this.ops, state)
    return [[new OpPlan({
      name: this.name,
      options: this.options,
      ops: cops
    })], ste]
  }

  execute (state: Readonly<State>): ExecResult {
    state = Object.assign(state, {
      planName: this.name,
      planUid: uidgen.generateSync()
    })

    return executeOps(this.ops, state)
  }
}

// -------------------------------------------
// DEF
// -------------------------------------------
class OpDef extends Op {
  constructor (args: OpInitData) {
    super('def', args)
  }

  substitute (state: Readonly<State>, strict: boolean): OpDef {
    return new OpDef({
      options: substitute(this.options, state, strict)
    })
  }

  compile (state: Readonly<State>): Result {
    // Upsert these vars into the state
    return [[], Object.assign({}, state, this.options)]
  }
}

// -------------------------------------------
// SEQ
// -------------------------------------------
class OpSeq extends Op {
  constructor (args: OpInitData) {
    super('seq', args)
  }

  substitute (state: Readonly<State>, strict: boolean): OpSeq {
    // Remove existing "local" vars X and I
    const seqState = { ...state }
    delete seqState.X
    delete seqState.I
    return new OpSeq({
      options: this.options,
      name: substitute(this.name, seqState, strict),
      ops: this.ops.map((o) => o.substitute(seqState, strict))
    })
  }

  compile (state: Readonly<State>): Result {
    let compiled: Op[] = []

    const { start, end, by } = seqOpts(this.name ? this.name : this.options)

    let i
    for (i = start; i <= end; i += by) {
      const withState = Object.assign({}, state, {
        X: ('' + i).padStart(5, '0'),
        I: i
      })
      const [cops] = compileOps(this.ops, withState) // Note: dumps state?
      if (cops.length > 0) {
        compiled = compiled.concat(cops)
      }
    }
    return [compiled, state]
  }
}

export function seqOpts (opts: any): {start: number, end: number, by: number } {
  let start = 0
  let end
  let by = 1
  if (typeof opts === 'object') {
    if (typeof opts.start !== 'undefined') {
      start = opts.start
    }
    if (typeof opts.end !== 'undefined') {
      end = opts.end
    } else if (typeof opts.count !== 'undefined') {
      end = start + (opts.count - 1)
    }
    if (typeof opts.by !== 'undefined') {
      by = opts.by
    }
  } else {
    if (typeof opts !== 'string') {
      throw Error('seq requires either an options object or string initializer')
    }
    const o = opts.split(' ')

    if (o.length === 1) {
      // "count"
      end = start + (parseInt(o[0], 10) - 1)
    } else if (o.length >= 2) {
      // "start end"
      start = parseInt(o[0], 10)
      end = parseInt(o[1], 10)
      if (o.length === 3) {
        // "by"
        by = parseInt(o[2], 10)
      }
    }
  }
  return { start, end, by }
}

// -------------------------------------------
// WITH
// -------------------------------------------
class OpWith extends Op {
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

// -------------------------------------------
// INCLUDE
// -------------------------------------------
class OpInclude extends Op {
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

// -------------------------------------------
// PIPELINE
// -------------------------------------------
function stringOrNumber (val: any, def: number): number {
  if (typeof val === 'number') {
    return val
  } else if (typeof val === 'string') {
    return parseInt(val, 10)
  }
  return def
}

class OpPipeline extends Op {
  constructor (args: OpInitData) {
    super('pipeline', args)
  }

  substitute (state: Readonly<State>, strict: boolean): OpPipeline {
    return new OpPipeline({
      options: substitute(this.options, state, strict),
      name: substitute(this.name, state, strict),
      ops: this.ops.map((o) => o.substitute(state, strict))
    })
  }

  compile (state: Readonly<State>): Result {
    const compiled: Op[] = []

    this.ops.forEach((o) => {
      if (o.keyword !== 'pipe') {
        throw Error('OpPipeline must contain a list of OpPipe operations')
      }
    })

    const concurrency = Math.max(stringOrNumber(this.options.concurrency, 1), 1)
    const depth = Math.max(stringOrNumber(this.options.depth, 1), 1)
    const pipes = this.ops.length

    type PipeStep = {
      pre: Op[]
      post: Op[]
      spread: Op[]
    }
    const cSteps: PipeStep[][] = []
    let tempOps: Op[] = []

    // Compile all pipes for each value of depth
    for (let i = 0; i < depth; i++) {
      const pipeState = Object.assign({}, state, {
        P_X: ('' + i).padStart(5, '0'),
        P_I: i
      })
      const cPipes: PipeStep[] = []
      // console.error(util.inspect(this, false, null, true /* enable colors */))
      this.ops.forEach((o) => {
        // console.error(util.inspect(o, false, null, true /* enable colors */))
        let pre: Op[] = []
        if (Array.isArray(o.options.pre)) {
          [pre] = compileOps(o.options.pre, pipeState)
        }
        let post: Op[] = []
        if (Array.isArray(o.options.pre)) {
          [post] = compileOps(o.options.pre, pipeState)
        }
        const [spread] = compileOps(o.ops, pipeState)
        tempOps = tempOps.concat(spread)
        cPipes.push({
          pre,
          post,
          spread
        })
      })
      cSteps.push(cPipes)
    }

    // Arrange into the sequenced pipeline
    const pipeline: PipeStep[][] = []
    cSteps.forEach((s, i) => {
      const loc = pipes * i / concurrency
      s.forEach((t, j) => {
        const idx = loc + j + i % pipes
        if (!pipeline[idx]) {
          pipeline[idx] = []
        }
        pipeline[idx].push(t)
      })
    })

    // const pre: Op[][] = []
    // const post: Op[][] = []
    // const spread: Op[][] = []

    // this.ops.forEach((o) => {
    //   if (Array.isArray(o.options.pre)) {
    //     pre.push(o.options.pre as Op[])
    //   } else {
    //     pre.push([])
    //   }
    //   if (Array.isArray(o.options.post)) {
    //     post.push(o.options.post as Op[])
    //   } else {
    //     post.push([])
    //   }
    //   spread.push([...o.ops])
    // })

    // const steps = depth + (concurrency - 1)
    // const steps = []
    // const nsteps = Math.ceil(depth / concurrency) * pipes
    // for (let n = 0; n < nsteps; n++) {
    //   const step = []
    //   for (let i = 0; i < concurrency; i++) {
    //     for (let j = 0; j < pipes; j++) {
    //       const idx = n * pipes
    //       const p =
    //       if (idx > 0 && idx < this.ops.length) {
    //         step.push(this.ops[])
    //       }
    //     }
    //   }
    // }

    // let i
    // for (i = start; i <= end; i += by) {
    //   const withState = Object.assign({}, state, {
    //     P_X: ('' + i).padStart(5, '0'),
    //     P_I: i
    //   })
    //   const [cops] = compileOps(this.ops, withState) // Note: dumps state?
    //   if (cops.length > 0) {
    //     compiled = compiled.concat(cops)
    //   }
    // }
    return [tempOps, state]
  }
}

// -------------------------------------------
// PIPE
// -------------------------------------------
class OpPipe extends Op {
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

  compile (state: Readonly<State>): Result {
    const [cops, ste] = compileOps(this.ops, state)
    // console.error(util.inspect(cops, false, null, true /* enable colors */))
    // console.error(util.inspect(this.options, false, null, true /* enable colors */))
    return [[new OpPipe({
      name: this.name,
      options: this.options,
      ops: cops
    })], ste]
  }
}
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

// Just for reference
// type Op2 = [string, string | {} | Array<unknown>]
// type Op3 = [string, string | {}, {} | Array<unknown>]
// type Op4 = [string, string, {}, Array<unknown>]

// -------------------------------------------
function preParse (op: any[]): OpData {
  if (!Array.isArray(op) || op.length < 2 || op.length > 4) {
    throw Error('Oper parse data must be an array with 2 to 4 elements')
  }
  if (typeof op[0] !== 'string' || !opKeywords.includes(op[0])) {
    throw Error(`First element of oper parse data must ba a keyword string. Received "${op[0]}`)
  }
  if (typeof op[1] !== 'string' && typeof op[1] !== 'object' && !Array.isArray(op[1])) {
    throw Error('Second element of oper parse data must be a string, object, or array')
  }
  if (op.length === 3) {
    if (Array.isArray(op[1])) {
      throw Error('Second element must be string or object')
    }
    if (!Array.isArray(op[2]) && typeof op[2] !== 'object') {
      throw Error('Third element of oper parse data must be an array or object')
    }
  }
  if (op.length === 4) {
    if (typeof op[1] !== 'string') {
      throw Error('Second element must be a string')
    }
    if (typeof op[2] !== 'object') {
      throw Error('Third element must be an object')
    }
    if (!Array.isArray(op[3])) {
      throw Error('Fourth element must be an array')
    }
  }

  let name = ''
  let options: Props = {}
  let ops: any[] = []

  const data = [...op]
  const keyword = data.shift()

  let d
  while ((d = data.shift())) {
    if (Array.isArray(d)) {
      ops = [...d]
    } else if (typeof d === 'object') {
      options = { ...d }
    } else {
      if (typeof d !== 'string') {
        throw Error(`Unexpected data in parseOpArgs = ${JSON.stringify(op)}`)
      }
      name = d
    }
  }

  return [keyword, [name, options, ops]]
}
