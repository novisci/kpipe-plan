"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
test('compile plan with include', async () => {
    const ops = JSON.parse(require('fs').readFileSync('./test/include-plan.json'));
    // console.error('IN', JSON.stringify(ops))
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const [[...cops], { ...state }] = await __1.compileOps(__1.parseOps(ops), {});
    // console.error('OUT', JSON.stringify(cops))
    expect(JSON.stringify(cops))
        .toBe(JSON.stringify([['plan', 'Test include', [['stage', 'Included stage', [['echo', 'Testing substitution']]]]]]));
});
//# sourceMappingURL=include-file.spec.js.map