// declare class Op {}
// type Props = { [key: string]: (string | number | string[] | number[] | Op[]) }
type Props = { [key: string]: any}

// type State = { [key: string]: (string | number | Props) }
export interface TaskIndex {
  planUid: string
  stageIdx: number
  stepIdx: number
  taskUid: string
}

// -------------------------------------------
export interface Task {
  readonly taskId: string
  readonly op: string
  readonly cmd: string
  readonly args: string[]
}

export type SerializedTask = any[]

export function serializeTask (t: Task): SerializedTask {
  return [
    t.taskId,
    [ t.op, t.cmd, t.args ]
  ]
}

export function emitTasks (tasks: Task[], stream: any): void {
  stream.write('[\n')
  tasks.forEach((t, i) => {
    stream.write('  ' + JSON.stringify(serializeTask(t)))
    if (i < tasks.length - 1) {
      stream.write(',')
    }
    stream.write('\n')
  })
  stream.write(']\n')
}

export const taskId = (state: Readonly<TaskIndex>): string => `${state.planUid}-${('' + state.stageIdx).padStart(2, '0')}-${('' + state.stepIdx).padStart(2, '0')}-${state.taskUid}`

export const stateFromTaskId = (id: string): TaskIndex => {
  const r = /([A-Za-z0-9]+)-(\d+)-(\d+)-([A-Za-z0-9]+)/
  const m = r.exec(id)
  if (!m) {
    throw Error(`"${id}" is not a task id`)
  }
  return {
    planUid: m[1],
    stageIdx: parseInt(m[2], 10),
    stepIdx: parseInt(m[3], 10),
    taskUid: m[4]
  }
}
