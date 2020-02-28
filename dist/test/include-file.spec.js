"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const oper_1 = require("../src/oper");
test('compile plan with include', () => {
    const ops = JSON.parse(require('fs').readFileSync('./test/include-plan.json'));
    //console.error('IN', JSON.stringify(ops))
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const [[...cops], { ...state }] = oper_1.compileOps(oper_1.parseOps(ops), {});
    //console.error('OUT', JSON.stringify(cops))
    expect(JSON.stringify(cops))
        .toBe(JSON.stringify([["plan", "Test include", [["stage", "Included stage", [["echo", "Testing substitution"]]]]]]));
});
//# sourceMappingURL=include-file.spec.js.map