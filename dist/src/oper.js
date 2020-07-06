"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// -------------------------------------------
async function compileOps(ops, state) {
    let compiled = [];
    let withState = state;
    await ops.reduce(async (prev, o) => {
        await prev;
        const [cops, ste] = await o.substitute(withState, false).compile(withState);
        compiled = compiled.concat(cops);
        withState = ste;
        // console.debug(withState)
    }, Promise.resolve());
    return [compiled, withState];
}
exports.compileOps = compileOps;
// -------------------------------------------
function executeOps(ops, state) {
    let executed = [];
    let withState = { ...state };
    ops.forEach((o) => {
        const [ops, ste] = o.substitute(withState, true).execute(withState);
        executed = executed.concat(ops);
        withState = ste;
    });
    return [executed, withState];
}
exports.executeOps = executeOps;
//# sourceMappingURL=oper.js.map