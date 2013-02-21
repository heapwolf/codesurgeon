# SYNOPSIS
Build a subset or superset of a code base.

# DESCRIPTION
Rather than breaking apart files at design-time for the purpose of targeted
distribution, you can break them apart using a filter at build-time. 


# EXAMPLES
As the Javascript file is traversed and syntax is discovered, you will have the
opportunity to interject, for example:

### Input
```js
var a = 10
var b = 11
var c = 12
```

### Code

```js
var cs = require('codesurgeon')

var filter = cs.filter()

filter.inclusive = true

filter.syntax.VariableDeclaration = function(name, item) {
  if (name === 'b') {
    return true
  }
}

fstream
  .Reader('example.js')
  .pipe(filter)
  .pipe(process.stdout)
```

### Output
```js
var b = 11
```

A filter supports a streaming style API, but most operations block processing so
this is purely for convenience.

# Syntax Reference

`AssignmentExpression`
`ArrayExpression`
`ArrayPattern`
`BlockStatement`
`BinaryExpression`
`BreakStatement`
`CallExpression`
`CatchClause`
`ComprehensionBlock`
`ComprehensionExpression`
`ConditionalExpression`
`ContinueStatement`
`DirectiveStatement`
`DoWhileStatement`
`DebuggerStatement`
`EmptyStatement`
`ExpressionStatement`
`ForStatement`
`ForInStatement`
`FunctionDeclaration`
`FunctionExpression`
`Identifier`
`IfStatement`
`Literal`
`LabeledStatement`
`LogicalExpression`
`MemberExpression`
`NewExpression`
`ObjectExpression`
`ObjectPattern`
`Program`
`Property`
`ReturnStatement`
`SequenceExpression`
`SwitchStatement`
`SwitchCase`
`ThisExpression`
`ThrowStatement`
`TryStatement`
`UnaryExpression`
`UpdateExpression`
`VariableDeclaration`
`VariableDeclarator`
`WhileStatement`
`WithStatement`
`YieldExpression`

# LICENSE
(The MIT License)

Copyright (c) 2010 hij1nx <http://www.twitter.com/hij1nx>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
