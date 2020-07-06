import { Writable } from 'stream'
import { Op } from './op'

// -------------
export function renderOpList (cops: Op[]): void {
  process.stderr.write('[\n')
  cops.forEach((o: Op, i: number) => {
    renderOp(o, process.stderr)
    if (i < cops.length - 1) {
      process.stderr.write(',\n')
    }
  })
  process.stderr.write(']\n')
}

function renderOp (cop: Op, stream: Writable, indent = 0, term = ''): void {
  const opcode = cop.keyword
  if (['plan', 'spread', 'stage'].includes(opcode)) {
    // Group ops
    stream.write('  '.repeat(indent) + `["${cop.keyword}","${cop.name}",[` + '\n')
    cop.ops.forEach((o, i) => {
      renderOp(o, stream, indent + 1, i < cop.ops.length - 1 ? ',' : '')
    })
    stream.write('  '.repeat(indent) + ']]' + term + '\n')
  } else {
    // Single ops
    stream.write('  '.repeat(indent) + JSON.stringify(cop) + term + '\n')
  }
}
