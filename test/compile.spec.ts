import { compileOps, parseOps } from '..'
import { seqOpts } from '../src/ops/seq'

const testCompile = async (ops: any[]): Promise<void> => {
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [[...cops], { ...state }] = await compileOps(parseOps(ops), {})
}

test('malformed input (<2 elements) throws error', async () => {
  await expect(async () => testCompile([['def']])).rejects
})

test('malformed input (>3 elements) throws error', async () => {
  await expect(async () => testCompile([['def', {}, {}, []]])).rejects
})

test('malformed input (non-keyword) throws error', async () => {
  await expect(async () => testCompile([['fed', {}]])).rejects
})

test('malformed input (array not-last) throws error', async () => {
  await expect(async () => testCompile([['def', [], {}]])).rejects
})

test('malformed input (nested throws error', async () => {
  await expect(async () => testCompile([
    ['def', {}],
    ['with', {}, [
      ['task', 'one'],
      ['task', 'two'],
      ['fred']
    ]]
  ])).rejects
})

test('def operation substitues values', async () => {
  const ops = [
    ['def', {
      param: 'Freddo',
      arg: 'Bull'
    }],
    ['task', 'ferdinand', ['arg1', 'arg2', '${param}']], /* eslint-disable-line no-template-curly-in-string */
    ['echo', '${arg}'], /* eslint-disable-line no-template-curly-in-string */
    ['task', 'flowerSmell', ['arg1']]
  ]

  // console.error('IN', ...ops)
  const [[...cops], { ...state }] = await compileOps(parseOps(ops), {})
  // console.error('OUT', ...cops)

  expect(JSON.stringify(cops))
    .toBe(JSON.stringify([
      [ 'task', 'ferdinand', [ 'arg1', 'arg2', 'Freddo' ] ],
      [ 'echo', 'Bull' ],
      [ 'task', 'flowerSmell', [ 'arg1' ] ]
    ]))

  expect(JSON.stringify(state))
    .toBe(JSON.stringify({
      param: 'Freddo',
      arg: 'Bull'
    }))
})

test('with operation generates sequences', async () => {
  const ops = [
    ['with', {
      PARITY: [0, 1],
      PART: ['fred', 'barney', 'wilma', 'betty'],
      IDX: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    }, [
      ['echo', '${IDX} ${PART} ${PARITY}'] /* eslint-disable-line no-template-curly-in-string */
    ]]
  ]

  // console.error('IN', ...ops)
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [[...cops], { ...state }] = await compileOps(parseOps(ops), {})
  // console.error('OUT', ...cops)

  expect(JSON.stringify(cops))
    .toBe(JSON.stringify([
      [ 'echo', '0 fred 0' ],
      [ 'echo', '1 barney 1' ],
      [ 'echo', '2 wilma 0' ],
      [ 'echo', '3 betty 1' ],
      [ 'echo', '4 fred 0' ],
      [ 'echo', '5 barney 1' ],
      [ 'echo', '6 wilma 0' ],
      [ 'echo', '7 betty 1' ],
      [ 'echo', '8 fred 0' ],
      [ 'echo', '9 barney 1' ]
    ]))
})

test('seq operation (start, end) interpolates operation string argument', async () => {
  const ops = [
    ['seq', { start: 1, end: 5 }, [
      ['echo', '${I} ${X} ${padZero(I+101)} ${concat(X, padZero(I+1))}'] /* eslint-disable-line no-template-curly-in-string */
    ]]
  ]

  // console.error('IN', ...ops)
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [[...cops], { ...state }] = await compileOps(parseOps(ops), {})
  // console.error('OUT', ...cops)

  expect(JSON.stringify(cops))
    .toBe(JSON.stringify([
      ['echo', '1 00001 00102 0000100002'],
      ['echo', '2 00002 00103 0000200003'],
      ['echo', '3 00003 00104 0000300004'],
      ['echo', '4 00004 00105 0000400005'],
      ['echo', '5 00005 00106 0000500006']
    ]))
})

/* eslint-disable-next-line quotes */
test('seq options {"start": 1, "end": 10} => {start: 1, end: 10, by: 1}', () => {
  const res = seqOpts(
    { start: 1, end: 10 }
  )

  expect(res.start).toBe(1)
  expect(res.end).toBe(10)
  expect(res.by).toBe(1)
})

/* eslint-disable-next-line quotes */
test('seq options {"count": 10} => {start: 0, end: 9, by: 1}', () => {
  const res = seqOpts(
    { count: 10 }
  )

  expect(res.start).toBe(0)
  expect(res.end).toBe(9)
  expect(res.by).toBe(1)
})

/* eslint-disable-next-line quotes */
test('seq options {"start": 1, "count": 10} => {start: 1, end: 10, by: 1}', () => {
  const res = seqOpts(
    { start: 1, count: 10 }
  )

  expect(res.start).toBe(1)
  expect(res.end).toBe(10)
  expect(res.by).toBe(1)
})

/* eslint-disable-next-line quotes */
test('seq options {"start": 1, "end": 10, "by": 2} => {start: 1, end: 10, by: 2}', () => {
  const res = seqOpts(
    { start: 1, end: 10, by: 2 }
  )

  expect(res.start).toBe(1)
  expect(res.end).toBe(10)
  expect(res.by).toBe(2)
})

/* eslint-disable-next-line quotes */
test('seq options {"count": 10, "by": 2} => {start: 0, end: 9, by: 2}', () => {
  const res = seqOpts(
    { count: 10, by: 2 }
  )

  expect(res.start).toBe(0)
  expect(res.end).toBe(9)
  expect(res.by).toBe(2)
})

/* eslint-disable-next-line quotes */
test('seq options "10" => {start: 0, end: 9, by: 1}', () => {
  const res = seqOpts('10')

  expect(res.start).toBe(0)
  expect(res.end).toBe(9)
  expect(res.by).toBe(1)
})

/* eslint-disable-next-line quotes */
test('seq "1 10" => {start: 1, end: 10, by: 1}', () => {
  const res = seqOpts('1 10')

  expect(res.start).toBe(1)
  expect(res.end).toBe(10)
  expect(res.by).toBe(1)
})

/* eslint-disable-next-line quotes */
test('seq "0 10 2" => {start: 0, end: 10, by: 2}', () => {
  const res = seqOpts('0 10 2')

  expect(res.start).toBe(0)
  expect(res.end).toBe(10)
  expect(res.by).toBe(2)
})
