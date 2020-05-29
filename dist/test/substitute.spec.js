"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const subs_1 = require("../src/subs");
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
    OBJ: {}
};
test('No variable substitution', () => {
    expect(subs_1.substitute('FRED', vars)).toBe('FRED');
});
test('Single variable substitution', () => {
    expect(subs_1.substitute('${X}', vars)).toBe('A');
});
test('Multiple variable substitution', () => {
    expect(subs_1.substitute('${X} ${X} ${Y} ${Z}', vars)).toBe('A A B C');
});
test('Missing variable unstrict substitution', () => {
    expect(subs_1.substitute('${J}', vars)).toBe('${J}');
});
test('Missing variable strict substitution', () => {
    expect(() => subs_1.substitute('${J}', vars, true)).toThrow();
});
test('concat() function concatenates strings', () => {
    expect(subs_1.substitute('${concat(A, B, C)}', vars)).toBe('onetwothree');
});
test('concat() function throws for non-strings', () => {
    expect(() => subs_1.substitute('${concat(A, BN, C)}', vars)).toThrow();
});
test('padZero() function pads number default 5 digits', () => {
    expect(subs_1.substitute('${padZero(AN)}', vars)).toBe('00001');
});
test('padZero() function pads number 10 digits', () => {
    expect(subs_1.substitute('${padZero(AN, 10)}', vars)).toBe('0000000001');
});
test('padZero() function pads string', () => {
    expect(subs_1.substitute('${padZero(B, 10)}', vars)).toBe('0000000two');
});
test('padZero() throws for non-string or non-number', () => {
    expect(() => subs_1.substitute('${padZero(OBJ, 10)}', vars)).toThrow();
});
test('padZero() throws for non-numeric padding', () => {
    expect(() => subs_1.substitute('${padZero(AN, B)}', vars)).toThrow();
});
test('substitute math expression', () => {
    expect(subs_1.substitute('${5 * AN + BN}', vars)).toBe('7');
});
test('substitute using min, max', () => {
    expect(subs_1.substitute('${min(AN, BN)} ${max(AN, BN)}', vars)).toBe('1 2');
});
/* eslint-enable no-template-curly-in-string */
//# sourceMappingURL=substitute.spec.js.map