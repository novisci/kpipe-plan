"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const subs_1 = require("../subs");
const op_1 = require("../op");
const oper_1 = require("../oper");
const parse_url_1 = __importDefault(require("../parse-url"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const s3_1 = __importDefault(require("aws-sdk/clients/s3"));
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
        const lines = await getList(this.name);
        await lines.reduce(async (prev, f) => {
            await prev;
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
async function getFsList(path) {
    return new Promise((resolve, reject) => {
        fs_1.default.readFile(path, (err, data) => {
            if (err)
                return reject(err);
            resolve(splitLines(data.toString()));
        });
    });
}
async function getS3List(bucket, key) {
    const s3 = new s3_1.default({
        apiVersion: '2017-08-08',
        region: 'us-east-1'
    });
    const params = {
        Bucket: bucket,
        Key: key
    };
    return new Promise((resolve, reject) => {
        s3.getObject(params, (err, data) => {
            if (err)
                return reject(err);
            resolve(splitLines(data.Body.toString()));
        });
    });
}
async function getList(url) {
    const comps = parse_url_1.default(url);
    switch (comps.protocol) {
        case 'fs':
            return getFsList(comps.path.join('/'));
        case 's3':
            return getS3List(comps.path[0], path_1.default.join(comps.path.slice(1).join('/')));
        default:
            throw Error(`OpList can only handle fs (filesystem) and S3 urls - "${url}"`);
    }
}
function splitLines(text) {
    const lines = [];
    let str = text;
    let idx = -1;
    while ((idx = str.indexOf('\n')) !== -1) {
        lines.push(str.slice(0, idx));
        str = str.slice(idx + 1);
    }
    if (str.length) {
        lines.push(str);
    }
    return lines;
}
//# sourceMappingURL=list.js.map