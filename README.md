# `kpipe` Plan Compiler

## Basics
A similar structure is used for all items found in a set of kpipe operations. Some arguments are optional and/or inferred by their position. The three forms of an operation are:

```json
[ "OP", "STRING", ([...ARGS])]
[ "OP", {...OPTS}, ([...ARGS])]
[ "OP", [...ARGS]]
```

String substitution is performed on all string values when the operation is invoked. An immutable state object is presented when the operation is parsed and invoked. Variables can be declared using a "def" operation and those variables will be presented to all subsequent operations and their children.

For Example:
```json
[
  ["def", {
    "param1": "Froderick Frankensteen"
  }],
  ["echo", "The name is ${param1}"]
]
```
Output
```
The name is Froderick Frankensteen
```

## Operations

### `def`
A _def_ defines a set of variables which are available to operations for substitution
```json
["def", {
  "param1": "This is the first parameter",
  "param2": "This is the second",
  "param3": "This is another ${var}",
  "arg1": "${1}"
}]
```
_Substitution is performed in def operations using variables defined by earlier or ancestor operations_

### `echo`
An _echo_ operation simply outputs a string to the log.
```json
["echo", "Write something to the log"]
```
```
Write something to the log
```

### `include`
An _include_ operation inserts the json contents of an external file into the operation chain. Variables present at the point of inclusion are available for substitution in the string values of the included file
```json
["include", "path/to/file.json", ["arg1", "arg2", "arg3"]]
```
_Note: Only relative paths are allowed and all paths are relative to the file defining the top-level plan_

### `task`
A _task_ is an invocation of a kpipe process (usually executes a command in tasks folder)

```json
["task", "tasks/convertCsv", [...ARGS]]
```
-or-
```json
["task", { "command": "tasks/convertCsv" }, [...ARGS]]
```

### `spread`
A _spread_ represents a list of tasks which may be executed concurrently

```json
[
  "spread", {}, [
    ["task", "tasks/convertCsv", {}, ]
  ]
]
```

### `with`
A _with_ is a parameterized tasks generator. Some inputs are provided, with iteration methods, and
a set of tasks are repeated for each of the provided iterations

```json
[
  "with",  {
    "PART": ["001", "002", "003"]
  }, [
    ["task", "tasks/convertFile", ["path/to/files/file+${PART}.csv"]]
  ]
]
```

This gets transformed into:
```json
[
  ["task", "tasks/convertFile", ["path/to/files/file+001.csv"]],
  ["task", "tasks/convertFile", ["path/to/files/file+002.csv"]],
  ["task", "tasks/convertFile", ["path/to/files/file+003.csv"]]
]
```

### `seq`
A _seq_ operation is similar to _with_ except it generates numeric sequences. The sequence is presented to the inner task list as the variables _X_ (padded string) and _I_ (numeric value)
```json
[
  "seq", "1 10 2", [
    ["task", "tasks/convertFile", ["path/to/files/file+${X}.csv"]]
  ]
]
```
-or-
```json
[
  "seq", {
    "start": 1,
    "end": 10,
    "by": 2
  }, [
    ["task", "tasks/convertFile", ["path/to/files/file+${X}.csv"]]
  ]
]
```
This gets transformed into:
```json
[
  ["task", "tasks/convertFile", ["path/to/files/file+001.csv"]],
  ["task", "tasks/convertFile", ["path/to/files/file+003.csv"]],
  ["task", "tasks/convertFile", ["path/to/files/file+005.csv"]],
  ["task", "tasks/convertFile", ["path/to/files/file+007.csv"]],
  ["task", "tasks/convertFile", ["path/to/files/file+009.csv"]]
]
```
Options

| Opts | Result |
|---|---|
|`{"start": 1, "end": 10}`|`[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]`|
|`{"start": 1, "end": 10, "by": 2}`|`[1, 3, 5, 7, 9]`|
|`{"count": 10}`|`[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]`|
|`{"start": 1, "count": 10}`|`[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]`|
|`{"count": 10, "by": 2}`|`[0, 2, 4, 6, 8]`|
|`"10"` _(count)_|`[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]`|
|`"1 10"` _(start, end)_|`[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]`|
|`"0 10 2"` _(start, end, by)_|`[0, 2, 4, 6, 8, 10]`|



### `stage`
A _stage_ is an idempotent sequence of operations which can be re-executed. 

```json
[
  "stage", NAME, {args}, [
    ["task", COMMAND, {}],
    ["spread", ]
  ]
]
```

### `plan`
A plan is a list of sequential stages.  Stages are assumed to be sequentially dependent on one another.
That is, before a stage may begin execution, all previous stages must have successfully executed.

```json
[ 
  "plan", {args}, [
    ["stage", "one", [...]],
    ["stage", "two", [...]]
  ]
]
```

## Topic Mapping

Topics
- Plan 
- Stage
- Task