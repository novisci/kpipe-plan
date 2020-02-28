function substituteString (str: string, vars: any, strict = false): string {
  const rx = /\${[^{}]*}/g
  return str.replace(rx, (m) => {
    const v: string = m.substring(2, m.length - 1)
    if (typeof vars[v] !== 'undefined') {
      return vars[v]
    }
    if (strict) {
      throw Error(`Variable "${v}" is undefined`)
    }
    return m
  })
}

type Props = { [key: string]: (string | number | string[] | number[]) }
type Vars = { [key: string]: (string | number | {}) }

function substituteObject (obj: Props, vars: Vars, strict = false): Props {
  const sobj: Props = {}
  Object.entries(obj).map((o) => {
    sobj[o[0]] = substitute(o[1], vars, strict)
  })
  return sobj
}

export function substitute (obj: any, vars: Vars, strict = false): any {
  if (typeof obj === 'string') {
    return substituteString(obj, vars, strict)
  }
  if (Array.isArray(obj)) {
    return obj.map((a) => substitute(a, vars, strict))
  }
  if (typeof obj === 'object') {
    return substituteObject(obj, vars, strict)
  }
  return obj
}
