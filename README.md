<br/>
<img src="http://github.com/hij1nx/codesurgeon/raw/master/logo.png">

## Synopsis
A library for precision code extraction. Hack, slash and stitch javascript code using node.

## Motivation
If you have a lot of libraries and need to build distributions of different configurations. This is the tool for you. It doesn't require you to crap up your file with any special syntax it parses the AST to extract your functions.

## Installation
`npm install codesurgeon`

## Usage
All writes are done synchronously, so you can chain them. Here are a few examples.

Source File

```js
function funcA() { return 'A'; }
function funcB() { return 'B'; }
function funcC() { return 'C'; }
```

Build Script

```js

var Codesurgeon = require('codesurgeon').Codesurgeon;
var surgeon = new Codesurgeon;

surgeon
  .configure({ // lets add some configuration options!
    quiet: true, // how about you just not say anything for now
    package: '../package.json' // an read my package.json
  })
  .read(__dirname + '/dummy.js') // add one or more files to analyze
  .extract('funcB') // specify the functions we want
  .write('write-test-output.js'); // write the file to disk
```

Destination File (uses my package.json to add a header and change the filename)

```js
//
// Generated on Thu Sep 29 2011 12:29:42 GMT-0400 (EDT) by Codesurgeon.
// Version 0.0.2
//

function funcB() { return 'B'; }
```

## API

### Constructor

#### function Codesurgeon(options)
The constructor function provides an instance of the Codesurgen.

### Instance Methods

#### function configure(options)
`@optons` {Object} a json object literal that can contain configuration options.
Allows you to pass configuration settings to the instance, helpful as you chain together methods.

#### function package(path)
`path` {String} a path to a valid `package.json` file.

Capture package details of a `package.json` file. Used in concert with the `write` method. The write method will attempt to read the file and 

#### function read(...files)
`files` {...String} a series of strings that represent the locations of files

#### function wrap(options)
`@optons` {Object} a json object literal that can contain configuration options.
`@optons:@outer` {String} code that will be appended outside of the closure.
`@optons:@before` {String} a string of code to prepend to the body of the closure.
`@optons:@after` {String} a string of code to append to the body of the closure.
`@optons:@params` {String} the parameters that you want to pass to the closure
`@optons:@signature` {String} the method signature (parameters that go inside the closure's parenthesis e.g. `function(foo, bar, bazz)` where "foo, bar, bazz" is the signature).

Wraps the code in a closure.

#### function extract(...methods)
`@methods` {...String} a series of strings that represent the methods that can be found in the code that has been read by the `read` method.

specifies the methods to extract from the files that have been read.

#### function write(file)
`@file` {String} a file name that will be created or overwritten.

Write the output to a file.

#### function append(file)
`@file` {String} a file name that will be appended to.

Write the output to a file.

#### function uglify(options)
`@optons` {Object} a json object literal that can contain configuration options.
`@optons:@squeeze` {String} Applies various compression techniques. It expects an AST (as returned by parse-js) and returns a new, compatible AST (possibly sharing structure with the original one!).
`@optons:@mangle` {String} This option is careful not to affect the semantics of the code. It will avoid renaming undeclared variables (which could possibly be defined in some other script), and avoid renaming names that are under the influence of a with block, or within the context of an eval call.

Compacts and obfuscates the code.

## Licence
(The MIT License)

Copyright (c) 2010 hij1nx <http://www.twitter.com/hij1nx>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
