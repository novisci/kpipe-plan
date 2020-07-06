"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const op_1 = require("./op");
const ops_1 = require("./ops");
// -------------------------------------------
function parseLeafArgs(d) {
    return [d[0], {
            name: d[1][0],
            options: d[1][1],
            args: d[1][2]
        }];
}
function parseNodeArgs(d) {
    return [d[0], {
            name: d[1][0],
            options: d[1][1],
            ops: parseOps(d[1][2])
        }];
}
function parsePipeArgs(d) {
    const options = { ...d[1][1] };
    if (options.pre) {
        options.pre = parseOps(options.pre);
    }
    if (options.post) {
        options.post = parseOps(options.post);
    }
    // console.error(util.inspect(options, false, null, true /* enable colors */))
    return [d[0], {
            name: d[1][0],
            options,
            ops: parseOps(d[1][2])
        }];
}
function parseOpInit(d) {
    switch (d[0]) {
        case 'echo': return parseLeafArgs(d);
        case 'task': return parseLeafArgs(d);
        case 'exec': return parseLeafArgs(d);
        case 'spread': return parseNodeArgs(d);
        case 'stage': return parseNodeArgs(d);
        case 'plan': return parseNodeArgs(d);
        case 'def': return parseLeafArgs(d);
        case 'seq': return parseNodeArgs(d);
        case 'with': return parseNodeArgs(d);
        case 'include': return parseNodeArgs(d);
        case 'pipeline': return parseNodeArgs(d);
        case 'pipe': return parsePipeArgs(d);
        case 'list': return parseNodeArgs(d);
        default:
            throw Error(`Unknown keyword "${d[0]}" in parseOpInit`);
    }
}
function createOp(d) {
    switch (d[0]) {
        case 'echo': return new ops_1.OpEcho(d[1]);
        case 'task': return new ops_1.OpTask(d[1]);
        case 'exec': return new ops_1.OpExec(d[1]);
        case 'spread': return new ops_1.OpSpread(d[1]);
        case 'stage': return new ops_1.OpStage(d[1]);
        case 'plan': return new ops_1.OpPlan(d[1]);
        case 'def': return new ops_1.OpDef(d[1]);
        case 'seq': return new ops_1.OpSeq(d[1]);
        case 'with': return new ops_1.OpWith(d[1]);
        case 'include': return new ops_1.OpInclude(d[1]);
        case 'pipeline': return new ops_1.OpPipeline(d[1]);
        case 'pipe': return new ops_1.OpPipe(d[1]);
        case 'list': return new ops_1.OpList(d[1]);
        default:
            throw Error(`Unknown keyword "${d[0]}" in parseOpInit`);
    }
}
function parseOps(data) {
    return data.map((d) => createOp(parseOpInit(preParse(d))));
}
exports.parseOps = parseOps;
// -------------------------------------------
function preParse(op) {
    if (!Array.isArray(op) || op.length < 2 || op.length > 4) {
        throw Error('Oper parse data must be an array with 2 to 4 elements');
    }
    if (typeof op[0] !== 'string' || !op_1.opKeywords.includes(op[0])) {
        throw Error(`First element of oper parse data must ba a keyword string. Received "${op[0]}`);
    }
    if (typeof op[1] !== 'string' && typeof op[1] !== 'object' && !Array.isArray(op[1])) {
        throw Error('Second element of oper parse data must be a string, object, or array');
    }
    if (op.length === 3) {
        if (Array.isArray(op[1])) {
            throw Error('Second element must be string or object');
        }
        if (!Array.isArray(op[2]) && typeof op[2] !== 'object') {
            throw Error('Third element of oper parse data must be an array or object');
        }
    }
    if (op.length === 4) {
        if (typeof op[1] !== 'string') {
            throw Error('Second element must be a string');
        }
        if (typeof op[2] !== 'object') {
            throw Error('Third element must be an object');
        }
        if (!Array.isArray(op[3])) {
            throw Error('Fourth element must be an array');
        }
    }
    let name = '';
    let options = {};
    let ops = [];
    const data = [...op];
    const keyword = data.shift();
    let d;
    while ((d = data.shift())) {
        if (Array.isArray(d)) {
            ops = [...d];
        }
        else if (typeof d === 'object') {
            options = { ...d };
        }
        else {
            if (typeof d !== 'string') {
                throw Error(`Unexpected data in parseOpArgs = ${JSON.stringify(op)}`);
            }
            name = d;
        }
    }
    return [keyword, [name, options, ops]];
}
//# sourceMappingURL=parse.js.map