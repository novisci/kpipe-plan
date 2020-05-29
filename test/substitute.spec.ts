import { substitute } from '../src/subs'

/* eslint-disable no-template-curly-in-string */

const vars = {
  X: 'A',
  Y: 'B',
  Z: 'C',
  A: 'one',
  B: 'two',
  C: 'three',
  AN: 1,
  BN: 2,
  CN: 3,
  OBJ: {
    J: 'jay',
    F: 'eff',
    K: 'kay'
  },
  ARR: [ 0, 1, 2, 3 ]
}

test('No variable substitution', () => {
  expect(substitute('FRED', vars)).toBe('FRED')
})

test('Single variable substitution', () => {
  expect(substitute('${X}', vars)).toBe('A')
})

test('Multiple variable substitution', () => {
  expect(substitute('${X} ${X} ${Y} ${Z}', vars)).toBe('A A B C')
})

test('Missing variable unstrict substitution', () => {
  expect(substitute('${J}', vars)).toBe('${J}')
})

test('Missing variable strict substitution', () => {
  expect(() => substitute('${J}', vars, true)).toThrow()
})

test('concat() function concatenates strings', () => {
  expect(substitute('${concat(A, B, C)}', vars)).toBe('onetwothree')
})

test('concat() function throws for non-strings', () => {
  expect(() => substitute('${concat(A, BN, C)}', vars)).toThrow()
})

test('padZero() function pads number default 5 digits', () => {
  expect(substitute('${padZero(AN)}', vars)).toBe('00001')
})

test('padZero() function pads number 10 digits', () => {
  expect(substitute('${padZero(AN, 10)}', vars)).toBe('0000000001')
})

test('padZero() function pads string', () => {
  expect(substitute('${padZero(B, 10)}', vars)).toBe('0000000two')
})

test('padZero() throws for non-string or non-number', () => {
  expect(() => substitute('${padZero(OBJ, 10)}', vars)).toThrow()
})

test('padZero() throws for non-numeric padding', () => {
  expect(() => substitute('${padZero(AN, B)}', vars)).toThrow()
})

test('substitute math expression', () => {
  expect(substitute('${5 * AN + BN}', vars)).toBe('7')
})

test('substitute using min, max', () => {
  expect(substitute('${min(AN, BN)} ${max(AN, BN)}', vars)).toBe('1 2')
})

test('substitute can access object/array elements', () => {
  expect(substitute('${OBJ.J} ${ARR[2]}', vars)).toBe('jay 2')
})

/* eslint-enable no-template-curly-in-string */
