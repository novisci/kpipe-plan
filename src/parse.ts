import { Op, OpData, OpInit, opKeywords, Props } from './op'
import {
  OpDef, OpEcho, OpExec, OpInclude, OpPipe,
  OpPipeline, OpPlan, OpSeq, OpSpread,
  OpStage, OpTask, OpWith
} from './ops'

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
