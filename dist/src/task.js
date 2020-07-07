"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function serializeTask(t) {
    return [
        t.taskId,
        [t.op, t.cmd, t.args]
    ];
}
exports.serializeTask = serializeTask;
function emitTasks(tasks, stream) {
    stream.write('[\n');
    tasks.forEach((t, i) => {
        stream.write('  ' + JSON.stringify(serializeTask(t)));
        if (i < tasks.length - 1) {
            stream.write(',');
        }
        stream.write('\n');
    });
    stream.write(']\n');
}
exports.emitTasks = emitTasks;
exports.taskId = (state) => `${state.planUid}-${('' + state.stageIdx).padStart(2, '0')}-${('' + state.stepIdx).padStart(2, '0')}-${state.taskUid}`;
exports.stateFromTaskId = (id) => {
    const r = /([A-Za-z0-9]+)-(\d+)-(\d+)-([A-Za-z0-9]+)/;
    const m = r.exec(id);
    if (!m) {
        throw Error(`"${id}" is not a task id`);
    }
    return {
        planUid: m[1],
        stageIdx: parseInt(m[2], 10),
        stepIdx: parseInt(m[3], 10),
        taskUid: m[4]
    };
};
//# sourceMappingURL=task.js.map