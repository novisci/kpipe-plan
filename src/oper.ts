import { substitute } from './subs'
import { taskId, Task } from './task'

// -------------------------------------------
const runOpKeywords = ['echo', 'task', 'exec']
const compileOpKeywords = ['spread', 'stage', 'plan']
const macroOpKeywords = ['def', 'seq', 'with', 'include']
export const opKeywords = [...runOpKeywords, ...compileOpKeywords, ...macroOpKeywords]

type Props = { [key: string]: (string | number | string[] | number[]) }
type State = { [key: string]: (string | number) }
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
    if (init.options) {
      this.options = { ...init.options }
    }
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
      options: substitute(this.options, state, strict),
      ops: this.ops.map((o) => o.substitute(state, strict))
    })
  }

  compile (state: Readonly<State>): Result {
    let compiled: Op[] = []

    let n = 0
    Object.values(this.options).map((v) => {
      if (!Array.isArray(v)) {
        throw Error('with operation expects an options object with only array values')
      }
      n = Math.max(n, v.length)
    })

    let i = 0
    for (i = 0; i < n; i++) {
      const withState: State = Object.assign({}, state)
      Object.entries(this.options).map((e) => {
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

    return [compiled, state]
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
export function compileOps (ops: Op[], state: Readonly<State>): Result {
  let compiled: Op[] = []
  let withState: State = state
  ops.forEach((o) => {
    const [cops, ste] = o.substitute(withState, false).compile(withState)
    compiled = compiled.concat(cops)
    withState = ste
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

// -------------------------------------------
function preParse (op: any[]): OpData {
  if (!Array.isArray(op) || op.length < 2 || op.length > 3) {
    throw Error('Oper parse data must be an array with 2 or 3 elements')
  }
  if (typeof op[0] !== 'string' || !opKeywords.includes(op[0])) {
    throw Error(`First element of oper parse data must ba a keyword string. Received "${op[0]}`)
  }
  if (op.length === 3 && !Array.isArray(op[2])) {
    throw Error('Third element of oper parse data must be an array')
  }
  if (typeof op[1] !== 'string' && typeof op[1] !== 'object' && !Array.isArray(op[1])) {
    throw Error('Second element of oper parse data must be a string, object, or array')
  }
  if (Array.isArray(op[1]) && op.length === 3) {
    throw Error('Array element of oper parse data must be the last element')
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
