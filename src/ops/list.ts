import { substitute } from '../subs'
import { Op, OpInitData, State, Result } from '../op'
import { compileOps } from '../oper'
import parseUrl from '../parse-url'
import fs from 'fs'
import path from 'path'
import S3 from 'aws-sdk/clients/s3'

// -------------------------------------------
// LIST
// -------------------------------------------
export class OpList extends Op {
  constructor (args: OpInitData) {
    super('list', args)
  }

  substitute (state: Readonly<State>, strict: boolean): OpList {
    // Remove existing "local" var IT
    const listState = { ...state }
    delete listState.IT
    return new OpList({
      options: this.options,
      name: substitute(this.name, listState, strict),
      ops: this.ops.map((o) => o.substitute(listState, strict))
    })
  }

  async compile (state: Readonly<State>): Promise<Result> {
    let compiled: Op[] = []

    const lines = await getList(this.name)

    await lines.reduce(async (prev, f) => {
      await prev
      const withState = Object.assign({}, state, {
        IT: f
      })
      const [cops] = await compileOps(this.ops, withState) // Note: dumps state?
      if (cops.length > 0) {
        compiled = compiled.concat(cops)
      }
    }, Promise.resolve())

    return [compiled, state]
  }
}

async function getFsList (path: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) return reject(err)
      resolve(splitLines(data.toString()))
    })
  })
}

async function getS3List (bucket: string, key: string): Promise<string[]> {
  const s3 = new S3({
    apiVersion: '2017-08-08',
    region: 'us-east-1'
  })
  const params = {
    Bucket: bucket,
    Key: key
  }

  return new Promise((resolve, reject) => {
    s3.getObject(params, (err: any, data: any) => {
      if (err) return reject(err)
      resolve(splitLines(data.Body.toString()))
    })
  })
}

async function getList (url: string): Promise<string[]> {
  const comps = parseUrl(url)

  switch (comps.protocol) {
    case 'fs':
      return getFsList(comps.path.join('/'))
    case 's3':
      return getS3List(comps.path[0], path.join(comps.path.slice(1).join('/')))
    default:
      throw Error(`OpList can only handle fs (filesystem) and S3 urls - "${url}"`)
  }
}

function splitLines (text: string): string[] {
  const lines: string[] = []
  let str = text
  let idx = -1
  while ((idx = str.indexOf('\n')) !== -1) {
    lines.push(str.slice(0, idx))
    str = str.slice(idx + 1)
  }
  if (str.length) {
    lines.push(str)
  }
  return lines
}
