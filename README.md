# `kpipe` Plan Compiler

>**Breaking change for v1.0.0:** exported function `compileOps` has been changed to an async function and returns a `Promise<[ Op[], State ]>` instead of the former synchronous `Result` value, `[ Op[], State ]`


## Basics
A similar structure is used for all items found in a set of kpipe operations. Some arguments are optional and/or inferred by their position. The valid forms of an operation are:

```json
[ "OPCODE", [...OPS]]
[ "OPCODE", "STRING", ([...OPS])]
[ "OPCODE", {...DEF}, ([...OPS])]
[ "OPCODE", "STRING", {...DEF}, ([...OPS])]
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

## Expressions and Substitution

Expressions in strings embedded within the plan strings are enclosed with `${` and `}`. The expression within the enclosure is evaluated
and produces a string result which is substituted for the expression in the string. Variables defined in `def` ops or otherwise available
in the plan compile state (named `with`), are available as substitution variables in expressions. Math symbolic operators as well as unary and
binary math operators are available. `kpipe-plan` uses the module `expr-eval` (https://www.npmjs.com/package/expr-eval) to parse, simplify, and evaluate expressions.

In addition to the standard math expression operators, the following utility functions are available

- `padZero(x: string|number, n: number = 5): string` <br/> Left pad (with `0`) the supplied string or number `x` to `n` digits (default 5)
- `concat( ...args: string[]): string` <br/> Concatenate the supplied string arguments into a single string

## Basic Operations

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
An _echo_ operation simply outputs a string to the log. (primarily used for development or testing)
```json
["echo", "Write something to the log"]
```
```
Write something to the log
```

### `task`
A _task_ is an invocation of a kpipe process (usually executes a command in tasks folder depending on configuration of the machine)

```json
["task", "tasks/convertCsv", [...ARGS]]
```
-or-
```json
["task", { "command": "tasks/convertCsv" }, [...ARGS]]
```

### `exec`
An _exec_ will invoke a shell command on the machine. 

```json
["exec", "ls", ["/tmp"]]
```

### `spread`
A _spread_ represents a list of tasks which may be executed concurrently

```json
["spread", {}, [
  ["task", "tasks/convertCsv", ["file1.csv"] ],
  ["task", "tasks/convertCsv", ["file2.csv"] ],
  ["task", "tasks/convertCsv", ["file3.csv"] ]
]]
```

### `stage`
A _stage_ is a logical grouping of tasks. Conventionally used to define an idempotent operation which can be safely re-executed upon failure.

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

## Higher Order Operations

The following operations allow for higher level construction of the basic operations above. In general, when compiled, these operations are replaced with a set of basic operations built by the higher order statement. Typically, theses are used to loop over a set of values, such as partition numbers, and repeat a set of commands substituting the iterated value in each repeated set.

### `include`
An include statement will insert the contents of an external JSON file into the plan. 

```json
[
  "include", "relative/path/to/file"  
]
```

### `seq`
A _seq_ generates integer sequences. The sequence is presented to the inner task list as the variables _X_ (padded string, eg. `00023`) and _I_ (numeric value, eg. `23`)
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
  ["task", "tasks/convertFile", ["path/to/files/file+00001.csv"]],
  ["task", "tasks/convertFile", ["path/to/files/file+00003.csv"]],
  ["task", "tasks/convertFile", ["path/to/files/file+00005.csv"]],
  ["task", "tasks/convertFile", ["path/to/files/file+00007.csv"]],
  ["task", "tasks/convertFile", ["path/to/files/file+00009.csv"]]
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

_new in v1.0.0_

### `list`

A _list_ is an external reference to a text file stored on the filesystem or in Amazon S3. The contents of the file are read and the nested
Ops in the _list_ are repeated for every line in the file. The special variable _IT_ is set to the contents of the line for each repeated instance of the nested Ops. The _IT_ variable can be substituted in child ops (using `${IT}`) and it will be replaced with the current line in the file.

>Note: It's assumed the machine/user performing the compilation has sufficient permissions to access AWS and the S3 location. 

_new in v0.9.11_


A _with_ can specify a _name_. A named _with_ can be referred to in subsequent _with_ statements which will re-use the definition from earlier. This serves as a mechanism to lift the sequence arrays out of inner loops of tasks and avoid restatements of the with definitions. A named _with_ is maintained in the state when compiling the ops list, so it can be referred to inside dependent (externally defined) sub-plans.

_Note: Since the with definition is maintained as part of the compile state, its label must not interfere with other state variables used by the plan_

```json
[
  "with",  "FILEPARTS" {
    "PART": ["001", "002", "003"]
  }, [
    ["task", "tasks/convertFile", ["path/to/files/file+${PART}.csv"]]
  ]
]
...
[
  "with", "FILEPARTS", [
    ["task", "tasks/convertFile", ["path/to/otherfiles/file+${PART}.csv"]]
  ]
]
```
This gets transformed into:
```json
[
  ["task", "tasks/convertFile", ["path/to/files/file+001.csv"]],
  ["task", "tasks/convertFile", ["path/to/files/file+002.csv"]],
  ["task", "tasks/convertFile", ["path/to/files/file+003.csv"]],
  ...
  ["task", "tasks/convertFile", ["path/to/otherfiles/file+001.csv"]],
  ["task", "tasks/convertFile", ["path/to/otherfiles/file+002.csv"]],
  ["task", "tasks/convertFile", ["path/to/otherfiles/file+003.csv"]]
]
```
An empty named _with_ is valid. This will set the definition to the labeled variable, but will generate no sub-tasks.
```json
[
  ["with", "FILEPARTS", {
    "PART": ["001", "002", "003"]
  }],
  ...
  ["with", "FILEPARTS", [
    ["task", "tasks/convertFile", ["path/to/files/file+${PART}.csv"]]
  ]]
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

_new in v0.10.0_

### `pipeline`
A _pipeline_ defines a sequence of operations (see _pipe_ below) which can be performed in parallel, such as operating on a partition of a file set. The _pipeline_ allows for controllably executing the operations in parallel contrained to a certain level of concurrency. (Limits the number of concurrently executing _pipe_ sequences). The _pipeline_ operation will be replaced upon compilation with a sequence of _spread_ operations which encompasses the concurrent work for a total number of _pipe_ sequences (defined by the depth parameter)

```json
["pipeline", {
  "concurrency": 10,
  "depth": 1000,
}, [
  ["pipe", ... ],
  ["pipe", ... ],
  ["pipe", ... ],
  ["pipe", ... ]
]]
```

### `pipe`

A _pipe_ is a step in a _pipeline_. (_pipeline_ may only contain _pipe_ as sub-operations). A _pipe_ operation defines a list of sub-operations which will be grouped into a _spread_ operation with other stages of _pipe_ operations. Optionally, a _pipe_ may define a set of step-wise (non-spread) operations to perform setup of the sub-operations, or their tear-down. 
A _pipeline_ provides to _pipe_ operations the state variables _P_X_ (a padded string, eg. `00023`) and _P_I_ (an integer, eg. `23`) which represent the value of the _depth_ of the pipeline

```json
["pipe", {
  "pre": [["exec", "kpipe", ["create", "topicA"]]],
  "post": [["echo", "Pipe ${P_X} complete"]]
}, [
  ["task", "tasks/storepartition", ["topicA", "s3://anybucket/file+${P_X}"]]
]]
```
