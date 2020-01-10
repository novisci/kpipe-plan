"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const oper_1 = require("../src/oper");
test('plan operation creates plan group', () => {
    const ops = [
        ['plan', 'testing', [
                ['echo', 'plan 1']
            ]],
        ['plan', 'testing 2', [
                ['echo', 'plan 2']
            ]]
    ];
    // console.error('IN', ops)
    const [[...cops], { ...state }] = oper_1.compileOps(oper_1.parseOps(ops), {});
    // console.error('OUT', cops)
    expect(JSON.stringify(cops))
        .toBe(JSON.stringify(ops));
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
});
//# sourceMappingURL=compile-groups.spec.js.map