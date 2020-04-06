import { compileOps, parseOps } from '..'

test('plan operation creates plan group', () => {
  const ops = [
    [ 'plan', 'testing', [
      ['echo', 'plan 1']
    ]],
    [ 'plan', 'testing 2', [
      ['echo', 'plan 2']
    ]]
  ]

  // console.error('IN', ops)
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [[...cops], { ...state }] = compileOps(parseOps(ops), {})
  // console.error('OUT', cops)

  expect(JSON.stringify(cops))
    .toBe(JSON.stringify(ops))

  // expect(JSON.stringify(cops))
  //   .toBe(JSON.stringify([
  //     [ 'task', 'ferdinand', [ 'arg1', 'arg2', 'Freddo' ] ],
  //     [ 'echo', 'Bull' ],
  //     [ 'task', 'flowerSmell', [ 'arg1' ] ]
  //   ]))

  // expect(JSON.stringify(state))
  //   .toBe(JSON.stringify({
  //     param: 'Freddo',
  //     arg: 'Bull'
  //   }))
})
