import { substitute } from '../subs'
import { Op, OpInitData, State, Result } from '../op'
import { compileOps } from  '../oper'

// -------------------------------------------
// SEQ
// -------------------------------------------
export class OpSeq extends Op {
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
