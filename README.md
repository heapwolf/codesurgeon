<br/>
<img src="http://github.com/hij1nx/codesurgeon/raw/master/logo.png">

## Synopsis
A library for `precision code extraction`. Hack, slash and stitch javascript code using Node.js. Also optionally performs code minification, obfuscation, lint and hint on the final product. You can also use codesurgon to simply concatenate files.

## Motivation
If you have a lot of libraries and need to build distributions of different configurations. This is the tool for you. It doesn't require you to crap up your file with any special syntax it parses the AST to extract your functions.

## Installation
`npm install codesurgeon`

## Usage
All writes are done synchronously by default (can be done asynchronously), so you can chain them. Here are a few examples.

### Source file

```js
function funcA() { return 'A'; }
function funcB() { return 'B'; }
var variable1 = 100 + 100;
var variable2 = 100 + 100;
function funcC() { return 'C'; }
```

### Build script examples using the above source file

```js

//
// don't use this example code, the file paths are wrong. 
// see the tests for cut and paste if you're feeling lazy.
//
var Codesurgeon = require('codesurgeon').Codesurgeon;
var surgeon = new Codesurgeon;    // make an instance

surgeon
  .configure({                    // lets add some configuration options!
    quiet: true,                  // how about you just not say anything for now
    package: '../package.json'    // an read my package.json
  })
  .read('/src.js')                // add one or more files to analyze
  .extract(                       // specify the names in the order we want them to be compiled
    'funcB',
    'variable2'
  )
  .write(__dirname + '/dest.js'); // write the file to disk

```

Read and write methods can be used asynchronously by adding a callback!

```js

  surgeon
    .configure({
      quiet: true,
      package: '../package.json'
    })
    .read(
      '/src1.js',
      '/src2.js',
      function() { // callback to fire after reading...

        this.extract() // calling `extract` without parameters extracts everything from the file
        this.write(__dirname + '/dest.js');

      }
    );
```

### Destination File 

Uses the specified package.json to add a header and change the filename to include the version number.

```js
//
// Generated on Thu Sep 29 2011 12:29:42 GMT-0400 (EDT) by Codesurgeon.
// Version 0.1.6
//

function funcB() { return 'B'; }
var variable2 = 100 + 100;
```

### Extract something and assign it a new name

Also, it's easy to change the name of an item that is extracted!

```js
surgeon
  .read(
    '/dummy1.js', 
    '/dummy2.js'
  )
  .extract(
    'funcA',
    ['funcC', 'funcD'] // rename the item (works with dot notation too)
  );
```

### Destination File

```js
//
// Generated on Thu Sep 29 2011 12:29:42 GMT-0400 (EDT) by Codesurgeon.
// Version 0.1.6
//
function funcA() { return 'A'; }
function funcD() { return 'C'; } // this has been renamed
```


## API

### Constructor

#### Codesurgeon(options)

```
`options` {Object} a json object literal that can contain configuration options.
`options:encoding` {String} the encoding that will be used to product the result.
`options:quiet` {String} indicate how much logging you want Codesurgen to produce.
```

The constructor function provides an instance of the Codesurgen.

### Instance Methods

#### configure(options)

```
`options` {Object} a json object literal that can contain configuration options.
```

Allows you to pass configuration settings to the instance, helpful as you chain together methods.

#### package(path)

```
`path` {String} a path to a valid `package.json` file.
```

Capture package details of a `package.json` file. Used in concert with the `write` method. The write method will attempt to read the file and 

#### read(...files)

```
`files` {...String} a series of strings that represent the locations of files
```

Read one or more files from disk.

#### wrap(options)

```
`options` {Object} a json object literal that can contain configuration options.
`options:outer` {String} code that will be appended outside of the closure.
`options:before` {String} a string of code to prepend to the body of the closure.
`options:after` {String} a string of code to append to the body of the closure.
`options:params` {String} the parameters that you want to pass to the closure
`options:signature` {String} the method signature (parameters that go inside the closure's parenthesis e.g. `function(foo, bar, bazz)` where "foo, bar, bazz" is the signature).
```


Wraps the code in a closure.

#### extract(...methods) // WITHOUT PARAMETERS WILL GET EVERYTHING

```
`methods` {...String} a series of strings that represent the methods that can be found in the code that has been read by the `read` method.
```

Specifies the methods to extract from the files that have been read. You can specify a simple variable or function name such as `myMethod` or you can be specific about the item you are looking for, e.g. `MyConstructor.prototype.foo`. This is helpful in the case where you have another method named `foo` that might occur beforehand, e.g. `OtherConstructor.prototype.foo`.

#### write(file)

```
`file` {String} a file name that will be created or overwritten.
```

Write the output to a file.

#### append(file)

```
`file` {String} a file name that will be appended to.
```

Write the output to a file.

#### uglify(options)

```
`options` {Object} a json object literal that can contain configuration options.
`options:squeeze` {String} Applies various compression techniques. It expects an AST (as returned by parse-js) and returns a new, compatible AST (possibly sharing structure with the original one!).
`options:mangle` {String} This option is careful not to affect the semantics of the code. It will avoid renaming undeclared variables (which could possibly be defined in some other script), and avoid renaming names that are under the influence of a with block, or within the context of an eval call.
```

Compacts and obfuscates the code.


#### lint(success [, fail, options])

```
`success` {Function} a callback that will be executed if the code passed the requirements of the lint parser.
`fail` {Function} optional, a callback that will be executed if the code failed the requirements of the lint parser.
`options` {Object} optional, an object literal containing the options that are supported by the parser.
```

Strict javascript validation according to Duglass Crockford's JSLint specification (https://github.com/douglascrockford/JSLint)

Most of the options are booleans: They are all optional and have a default value of false. One of the options, predef, can be an array of names, which will be used to declare global variables, or an object whose keys are used as global names, with a boolean value that determines if they are assignable. If the code is not valid, you will see a print out of the issues that were found. The format of the errors will be printed in the form of an array of objects containing these members:

```js
{
    line      : The line (relative to 0) at which the lint was found
    character : The character (relative to 0) at which the lint was found
    reason    : The problem
    evidence  : The text line in which the problem occurred
    raw       : The raw message before the details were inserted
    a         : The first detail
    b         : The second detail
    c         : The third detail
    d         : The fourth detail
}
```

#### hint(success [, fail, options])

```
`success` {Function} a callback that will be executed if the code passed the requirements of the lint parser.
`fail` {Function} optional, a callback that will be executed if the code failed the requirements of the lint parser.
`options` {Object} optional, an object literal containing the options that are supported by the parser.
```

Less Strict javascript validation according to JSHint, a community-driven tool to detect errors in JavaScript code. (https://github.com/jshint)



## Licence
(The MIT License)

Copyright (c) 2010 hij1nx <http://www.twitter.com/hij1nx>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
