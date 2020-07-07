import { substitute } from '../subs'
import { Op, OpInitData, State, Result } from '../op'
import { parseOps } from '../parse'
import { compileOps } from '../oper'
import fs from 'fs'

// -------------------------------------------
// INCLUDE
// -------------------------------------------
export class OpInclude extends Op {
  constructor (args: OpInitData) {
    super('include', args)
  }

  substitute (state: Readonly<State>, strict: boolean): OpInclude {
    return new OpInclude({
      options: substitute(this.options, state, strict),
      name: substitute(this.name, state, strict)
    })
  }

  async compile (state: Readonly<State>): Promise<Result> {
    // Load external json file
    const path = this.name.replace(/\.json$/i, '')

    return new Promise((resolve, reject) => {
      fs.readFile(`${path}.json`, (err, body) => {
        if (err) return reject(err)
        let data = null
        try {
          data = JSON.parse(body.toString())
        } catch (err) {
          console.error(err)
          data = null
        }
        if (data && Array.isArray(data)) {
          return resolve(compileOps(parseOps(data), state))
        }
        reject(Error(`Unexpected include file object ${data}`))
      })
    })
  }
}
