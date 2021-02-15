import { substitute } from '../subs'
import { Op, OpInitData, State, Result } from '../op'
import { parseOps } from '../parse'
import { compileOps } from '../oper'
import fs from 'fs'
import path from 'path'

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
    if (!state.PLAN_FILE || typeof state.PLAN_FILE !== 'string') {
      return Promise.reject(Error('PLAN_FILE state variable not found'))
    }

    let planPath = this.name.replace(/\.json$/i, '')

    if (planPath.substr(0, 1) === '.') {
      // Relative paths begin with . (relative to current plan json)
      //  otherwise they are relative to the current working directory
      planPath = path.resolve(process.cwd(), path.dirname(state.PLAN_FILE), planPath)
    }

    return new Promise((resolve, reject) => {
      fs.readFile(`${planPath}.json`, (err, body) => {
        if (err) return reject(err)
        let data = null
        try {
          data = JSON.parse(body.toString())
        } catch (err) {
          console.error(err)
          data = null
        }
        if (data && Array.isArray(data)) {
          return resolve(compileOps(parseOps(data), {
            ...state,
            PLAN_FILE: `${planPath}.json`
          }))
        }
        reject(Error(`Unexpected include file object ${data}`))
      })
    })
  }
}
