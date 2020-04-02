import { substitute } from '../subs'
import { Op, OpInitData, State, Result } from '../op'
import { compileOps } from  '../oper'

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

export class OpPipeline extends Op {
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
