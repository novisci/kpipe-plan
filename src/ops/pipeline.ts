import { substitute } from '../subs'
import { Op, OpInitData, State, Result } from '../op'
import { compileOps } from '../oper'
import { OpSpread } from './spread'
// import * as util from 'util'

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

  async compile (state: Readonly<State>): Promise<Result> {
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
      [key: string]: Op[]
    }
    const cSteps: PipeStep[][] = []

    // Compile all pipes for each value of depth
    for (let i = 0; i < depth; i++) {
      const pipeState = Object.assign({}, state, {
        P_X: ('' + i).padStart(5, '0'),
        P_I: i
      })
      const cPipes: PipeStep[] = []
      // console.error(util.inspect(this, false, null, true /* enable colors */))
      // this.ops.forEach(async (o) => {
      await this.ops.reduce(async (prev, o) => {
        await prev
        // console.error(util.inspect(o, false, null, true /* enable colors */))
        let pre: Op[] = []
        if (Array.isArray(o.options.pre)) {
          [pre] = await compileOps(o.options.pre, pipeState)
        }
        let post: Op[] = []
        if (Array.isArray(o.options.post)) {
          [post] = await compileOps(o.options.post, pipeState)
        }
        const [spread] = await compileOps(o.ops, pipeState)
        cPipes.push({
          pre,
          post,
          spread
        })
      }, Promise.resolve())
      cSteps.push(cPipes)
    }

    // Arrange into the sequenced pipeline
    // const pipeline: PipeStep[][] = new Array(depth).fill(null).map(() => new Array(pipes).fill(null).map(() => ({
    //   pre: [],
    //   post: [],
    //   spread: []
    // })))
    const pipeline: PipeStep[][] = []
    cSteps.forEach((s, i) => {
      const loc = Math.floor(i / concurrency)
      s.forEach((t, j) => {
        const idx = loc + j + i % pipes
        // console.error(loc)
        // console.error(idx)
        if (!pipeline[idx]) {
          pipeline[idx] = []
        }
        pipeline[idx].push(t)
      })
    })

    // console.error(util.inspect(pipeline, false, null, true /* enable colors */))
    function compilePrePost (step: PipeStep[], slot: string, idx: number): void {
      const slots: Op[][] = []
      step.forEach((p) => {
        p[slot].forEach((x, i) => {
          if (!slots[i]) {
            slots[i] = []
          }
          slots[i].push(x)
        })
      })
      slots.forEach((p) => {
        compiled.push(new OpSpread({
          name: `${slot} ${idx}`,
          ops: p
        }))
      })
    }

    pipeline.forEach((step, i) => {
      // Collect pre
      compilePrePost(step, 'pre', i)
      // let pres: Op[][] = []
      // step.forEach((p) => {
      //   p.pre.forEach((x, i) => {
      //     if (!pres[i]) {
      //       pres[i] = []
      //     }
      //     pres[i].push(x)
      //   })
      // })
      // pres.forEach((p) => {
      //   compiled.push(new OpSpread({
      //     ops: p
      //   }))
      // })
      // Collect tasks
      let tasks: Op[] = []
      step.forEach((p) => {
        tasks = tasks.concat(p.spread)
      })
      compiled.push(new OpSpread({
        name: `tasks ${i}`,
        ops: tasks
      }))
      // Collect post
      compilePrePost(step, 'post', i)
      // step.forEach((p) => {
      //   p.post.forEach((x) => {
      //     compiled.push(x)
      //   })
      // })
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
    //   const [cops] = await compileOps(this.ops, withState) // Note: dumps state?
    //   if (cops.length > 0) {
    //     compiled = compiled.concat(cops)
    //   }
    // }
    return [compiled, state]
  }
}
