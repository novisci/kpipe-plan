import { compileOps, parseOps } from '..'

test('Read filesystem list', async () => {
  /* eslint-disable no-template-curly-in-string */
  const ops = [
    ['list', 'fs://test/list.txt', [
      ['task', 'test/task', ['${IT}']]
    ]]
  ]
  /* eslint-enable no-template-curly-in-string */

  // console.error('IN', ...ops)
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [[...cops], { ...state }] = await compileOps(parseOps(ops), {})
  // cops[0].forEach((o) => o.forEach((so) => console.error(JSON.stringify(so))))

  expect(JSON.stringify(cops))
    .toBe(JSON.stringify([
      ['task', 'test/task', ['one']],
      ['task', 'test/task', ['two']],
      ['task', 'test/task', ['three']],
      ['task', 'test/task', ['four']],
      ['task', 'test/task', ['five']],
      ['task', 'test/task', ['six']]
    ]))
})

test('Read S3 list', async () => {
  /* eslint-disable no-template-curly-in-string */
  const ops = [
    ['list', 's3://novisci-public/tests/list.txt', [
      ['task', 'test/task', ['${IT}']]
    ]]
  ]
  /* eslint-enable no-template-curly-in-string */

  // console.error('IN', ...ops)
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [[...cops], { ...state }] = await compileOps(parseOps(ops), {})
  // cops[0].forEach((o) => o.forEach((so) => console.error(JSON.stringify(so))))

  expect(JSON.stringify(cops))
    .toBe(JSON.stringify([
      ['task', 'test/task', ['one']],
      ['task', 'test/task', ['two']],
      ['task', 'test/task', ['three']],
      ['task', 'test/task', ['four']],
      ['task', 'test/task', ['five']],
      ['task', 'test/task', ['six']]
    ]))
})
