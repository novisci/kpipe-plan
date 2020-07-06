"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const subs_1 = require("../subs");
const op_1 = require("../op");
const oper_1 = require("../oper");
// -------------------------------------------
// LIST
// -------------------------------------------
class OpList extends op_1.Op {
    constructor(args) {
        super('list', args);
    }
    substitute(state, strict) {
        // Remove existing "local" var IT
        const listState = { ...state };
        delete listState.IT;
        return new OpList({
            options: this.options,
            name: subs_1.substitute(this.name, listState, strict),
            ops: this.ops.map((o) => o.substitute(listState, strict))
        });
    }
    async compile(state) {
        let compiled = [];
        const files = [];
        // files.forEach(async (f) => {
        await files.reduce(async (prev, f) => {
            const withState = Object.assign({}, state, {
                IT: f
            });
            const [cops] = await oper_1.compileOps(this.ops, withState); // Note: dumps state?
            if (cops.length > 0) {
                compiled = compiled.concat(cops);
            }
        }, Promise.resolve());
        return [compiled, state];
    }
}
exports.OpList = OpList;
//# sourceMappingURL=list.js.map