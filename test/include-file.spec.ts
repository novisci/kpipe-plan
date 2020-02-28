import { compileOps, parseOps } from '../src/oper'

test('compile plan with include', () => {
  const ops = JSON.parse(require('fs').readFileSync('./test/include-plan.json'))

  //console.error('IN', JSON.stringify(ops))
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [[...cops], { ...state }] = compileOps(parseOps(ops), {})
  //console.error('OUT', JSON.stringify(cops))

  expect(JSON.stringify(cops))
    .toBe(JSON.stringify([["plan","Test include",[["stage","Included stage",[["echo","Testing substitution"]]]]]]))

 })
