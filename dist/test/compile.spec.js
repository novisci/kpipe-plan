"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const oper_1 = require("../src/oper");
const testCompile = (ops) => {
    const [[...cops], { ...state }] = oper_1.compileOps(oper_1.parseOps(ops), {});
};
test('malformed input (<2 elements) throws error', () => {
    expect(() => testCompile([['def']])).toThrow();
});
test('malformed input (>3 elements) throws error', () => {
    expect(() => testCompile([['def', {}, {}, []]])).toThrow();
});
test('malformed input (non-keyword) throws error', () => {
    expect(() => testCompile([['fed', {}]])).toThrow();
});
test('malformed input (array not-last) throws error', () => {
    expect(() => testCompile([['def', [], {}]])).toThrow();
});
test('malformed input (nested throws error', () => {
    expect(() => testCompile([
        ['def', {}],
        ['with', {}, [
                ['task', 'one'],
                ['task', 'two'],
                ['fred']
            ]]
    ])).toThrow();
});
test('def operation substitues values', () => {
    const ops = [
        ['def', {
                param: 'Freddo',
                arg: 'Bull'
            }],
        ['task', 'ferdinand', ['arg1', 'arg2', '${param}']],
        ['echo', '${arg}'],
        ['task', 'flowerSmell', ['arg1']]
    ];
    // console.error('IN', ...ops)
    const [[...cops], { ...state }] = oper_1.compileOps(oper_1.parseOps(ops), {});
    // console.error('OUT', ...cops)
    expect(JSON.stringify(cops))
        .toBe(JSON.stringify([
        ['task', 'ferdinand', ['arg1', 'arg2', 'Freddo']],
        ['echo', 'Bull'],
        ['task', 'flowerSmell', ['arg1']]
    ]));
    expect(JSON.stringify(state))
        .toBe(JSON.stringify({
        param: 'Freddo',
        arg: 'Bull'
    }));
});
test('with operation generates sequences', () => {
    const ops = [
        ['with', {
                PARITY: [0, 1],
                PART: ['fred', 'barney', 'wilma', 'betty'],
                IDX: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
            }, [
                ['echo', '${IDX} ${PART} ${PARITY}']
            ]]
    ];
    // console.error('IN', ...ops)
    const [[...cops], { ...state }] = oper_1.compileOps(oper_1.parseOps(ops), {});
    // console.error('OUT', ...cops)
    expect(JSON.stringify(cops))
        .toBe(JSON.stringify([
        ['echo', '0 fred 0'],
        ['echo', '1 barney 1'],
        ['echo', '2 wilma 0'],
        ['echo', '3 betty 1'],
        ['echo', '4 fred 0'],
        ['echo', '5 barney 1'],
        ['echo', '6 wilma 0'],
        ['echo', '7 betty 1'],
        ['echo', '8 fred 0'],
        ['echo', '9 barney 1']
    ]));
});
test('seq operation (start, end) interpolates operation string argument', () => {
    const ops = [
        ["seq", { start: 1, end: 5 }, [
                ["echo", "${I} ${X}"]
            ]]
    ];
    // console.error('IN', ...ops)
    const [[...cops], { ...state }] = oper_1.compileOps(oper_1.parseOps(ops), {});
    // console.error('OUT', ...cops)
    expect(JSON.stringify(cops))
        .toBe(JSON.stringify([
        ['echo', '1 00001'],
        ['echo', '2 00002'],
        ['echo', '3 00003'],
        ['echo', '4 00004'],
        ['echo', '5 00005'],
    ]));
});
test('seq options {"start": 1, "end": 10} => {start: 1, end: 10, by: 1}', () => {
    const res = oper_1.seqOpts({ start: 1, end: 10 });
    expect(res.start).toBe(1);
    expect(res.end).toBe(10);
    expect(res.by).toBe(1);
});
test('seq options {"count": 10} => {start: 0, end: 9, by: 1}', () => {
    const res = oper_1.seqOpts({ count: 10 });
    expect(res.start).toBe(0);
    expect(res.end).toBe(9);
    expect(res.by).toBe(1);
});
test('seq options {"start": 1, "count": 10} => {start: 1, end: 10, by: 1}', () => {
    const res = oper_1.seqOpts({ start: 1, count: 10 });
    expect(res.start).toBe(1);
    expect(res.end).toBe(10);
    expect(res.by).toBe(1);
});
test('seq options {"start": 1, "end": 10, "by": 2} => {start: 1, end: 10, by: 2}', () => {
    const res = oper_1.seqOpts({ start: 1, end: 10, by: 2 });
    expect(res.start).toBe(1);
    expect(res.end).toBe(10);
    expect(res.by).toBe(2);
});
test('seq options {"count": 10, "by": 2} => {start: 0, end: 9, by: 2}', () => {
    const res = oper_1.seqOpts({ count: 10, by: 2 });
    expect(res.start).toBe(0);
    expect(res.end).toBe(9);
    expect(res.by).toBe(2);
});
test('seq options "10" => {start: 0, end: 9, by: 1}', () => {
    const res = oper_1.seqOpts("10");
    expect(res.start).toBe(0);
    expect(res.end).toBe(9);
    expect(res.by).toBe(1);
});
test('seq "1 10" => {start: 1, end: 10, by: 1}', () => {
    const res = oper_1.seqOpts("1 10");
    expect(res.start).toBe(1);
    expect(res.end).toBe(10);
    expect(res.by).toBe(1);
});
test('seq "0 10 2" => {start: 0, end: 10, by: 2}', () => {
    const res = oper_1.seqOpts("0 10 2");
    expect(res.start).toBe(0);
    expect(res.end).toBe(10);
    expect(res.by).toBe(2);
});
//# sourceMappingURL=compile.spec.js.map