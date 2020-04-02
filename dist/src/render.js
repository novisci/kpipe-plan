"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// -------------
function renderOpList(cops) {
    process.stderr.write('[\n');
    cops.forEach((o, i) => {
        renderOp(o, process.stderr);
        if (i < cops.length - 1) {
            process.stderr.write(',\n');
        }
    });
    process.stderr.write(']\n');
}
exports.renderOpList = renderOpList;
function renderOp(cop, stream, indent = 0, term = '') {
    const opcode = cop.keyword;
    if (['plan', 'spread', 'stage'].includes(opcode)) {
        // Group ops
        stream.write('  '.repeat(indent) + `["${cop.keyword}","${cop.name}",[` + '\n');
        cop.ops.forEach((o, i) => {
            renderOp(o, stream, indent + 1, i < cop.ops.length - 1 ? ',' : '');
        });
        stream.write('  '.repeat(indent) + ']]' + term + '\n');
    }
    else {
        // Single ops
        stream.write('  '.repeat(indent) + JSON.stringify(cop) + term + '\n');
    }
}
//# sourceMappingURL=render.js.map