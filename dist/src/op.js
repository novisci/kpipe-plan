"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// -------------------------------------------
const runOpKeywords = ['echo', 'task', 'exec'];
const compileOpKeywords = ['spread', 'stage', 'plan'];
const macroOpKeywords = ['def', 'seq', 'with', 'include', 'pipeline', 'pipe'];
exports.opKeywords = [...runOpKeywords, ...compileOpKeywords, ...macroOpKeywords];
// -------------------------------------------
// OP
// -------------------------------------------
class Op {
    constructor(keyword, init) {
        this.name = '';
        this.options = {};
        this.args = [];
        this.ops = [];
        this.keyword = keyword;
        if (init.name) {
            this.name = init.name;
        }
        // console.error(util.inspect(init.options, false, null, true /* enable colors */))
        if (init.options) {
            this.options = init.options;
        }
        // console.error(util.inspect(this.options, false, null, true /* enable colors */))
        if (init.args) {
            this.args = [...init.args];
        }
        if (init.ops) {
            this.ops = [...init.ops];
        }
    }
    toJSON() {
        const data = [];
        data.push(this.keyword);
        if (this.name) {
            data.push(this.name);
        }
        else if (this.options) {
            data.push(this.options);
        }
        if (this.ops.length) {
            const ops = [];
            this.ops.forEach((o) => {
                ops.push(o.toJSON());
            });
            data.push(ops);
        }
        else if (this.args.length) {
            data.push(this.args);
        }
        return data;
    }
    compile(state) {
        return [[this], state];
    }
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    substitute(state, strict) {
        throw Error('substitute() must be defined in Oper derived classes');
    }
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    execute(state) {
        throw Error(`execute() is undefined for ${this.keyword}`);
    }
}
exports.Op = Op;
//# sourceMappingURL=op.js.map