import { Parser, Expression } from 'expr-eval'

const parser = new Parser({
  operators: {
    // // These default to true, but are included to be explicit
    // add: true,
    // concatenate: true,
    // conditional: true,
    // divide: true,
    // factorial: true,
    // multiply: true,
    // power: true,
    // remainder: true,
    // subtract: true,

    // // Disable and, or, not, <, ==, !=, etc.
    // logical: false,
    // comparison: false,

    // // Disable 'in' and = operators
    // 'in': false,
    // assignment: false
  }
})

parser.functions.padZero = (s: any, p: any = 5): string => {
  if (typeof s !== 'number' && typeof s !== 'string') {
    throw Error(`padZero() argument must be a string or a number`)
  }
  if (typeof p !== 'number') {
    throw Error('padZero() padding must be a number')
  }
  return s.toString().padStart(p, '0')
}

parser.functions.concat = (...args: any[]): string => {
  args.forEach((a) => {
    if (typeof a !== 'string') {
      throw Error(`concat() accepts only string argments`)
    }
  })
  return ''.concat(...args)
}

// function evaluateExprOld (m: string, vars: any, strict: boolean): string {
//   const v = m.substring(2, m.length - 1)
//   if (typeof vars[v] !== 'undefined') {
//     return vars[v]
//   }
//   if (strict) {
//     throw Error(`Variable "${v} is undefined"`)
//   }
//   return m
// }

function evaluateExpr (m: string, vars: any, strict: boolean): string {
  const tmpl: string = m.substring(2, m.length - 1)
  const expr: Expression = parser.parse(tmpl)
  const simp: Expression = expr.simplify(vars)
  if (simp.variables().length > 0) {
    if (strict) {
      throw Error(`Undefined variables: ${simp.variables().join(', ')}`)
    }
    return '${' + simp.toString() + '}'
  }
  // let v = simp.toString()
  let v = simp.evaluate()

  if (typeof v === 'number') {
    v = v.toString()
  }

  if (typeof v === 'string' && v.match(/^".*"$/)) {
    v = v.substring(1, v.length - 1)
  }

  // console.debug(vars)
  // console.debug([tmpl, expr.symbols(), simp.symbols(), simp.toString(), v])
  return v
}

function substituteString (str: string, vars: any, strict = false): string {
  const rx = /\${[^{}]*}/g
  return str.replace(rx, (m) => {
    return evaluateExpr(m, vars, strict)
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
  if (typeof obj === 'object' && obj.constructor === Object) {
    return substituteObject(obj, vars, strict)
  }
  return obj
}
