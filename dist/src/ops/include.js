"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const subs_1 = require("../subs");
const op_1 = require("../op");
const parse_1 = require("../parse");
const oper_1 = require("../oper");
const fs_1 = __importDefault(require("fs"));
// -------------------------------------------
// INCLUDE
// -------------------------------------------
class OpInclude extends op_1.Op {
    constructor(args) {
        super('include', args);
    }
    substitute(state, strict) {
        return new OpInclude({
            options: subs_1.substitute(this.options, state, strict),
            name: subs_1.substitute(this.name, state, strict)
        });
    }
    async compile(state) {
        // Load external json file
        const path = this.name.replace(/\.json$/i, '');
        return new Promise((resolve, reject) => {
            fs_1.default.readFile(`${path}.json`, (err, body) => {
                if (err)
                    return reject(err);
                let data = null;
                try {
                    data = JSON.parse(body.toString());
                }
                catch (err) {
                    console.error(err);
                    data = null;
                }
                if (data && Array.isArray(data)) {
                    return resolve(oper_1.compileOps(parse_1.parseOps(data), state));
                }
                reject(Error(`Unexpected include file object ${data}`));
            });
        });
    }
}
exports.OpInclude = OpInclude;
//# sourceMappingURL=include.js.map