<br/>
<img src="http://github.com/hij1nx/codesurgeon/raw/master/logo.png">

# Synopsis
A build automation tool that allows you to aggregate, manipulate, refine and finalize a code base.

# Motivation
A build automation tool specifically made for Node.js.

# How it works
Codesurgon reads files and/or piped input into a buffer. The buffer is used as the source used to create output.

# Features
 - Precision extraction of functions or variables from the input buffer
  - Rename functions or variables as they are extracted
  - Control the depth at which variables and function are searched for
  - Extract any arbitrary value
 - Read multiple files and piped data to the input buffer
 - Concatenate files and piped data
 - Automatically wrap the output in a closure that can detect the javascript environment
 - Hint and or Lint the output
 - Reads your `package.json` to create versioned output filenames and up to date build comments
 - Chainable and asynchronous APIs

# Installation

```bash
$npm install codesurgeon
```

# Status

<img src="https://secure.travis-ci.org/hij1nx/codesurgeon.png" alt="build status">

# Usage
Write a javascript file and run it.

```bash
$node mybuildscript.js
```

Codesurgeon will appreciate piped input!

```bash
$cat myfile1.js myfile2.js | node mybuildfile.js
```

## Synchronous example
All writes are done synchronously by default (can be done asynchronously), so you can chain them. Here are a few examples. Here is a Build script examples using the above source file

```js
var Codesurgeon = require('codesurgeon').Codesurgeon;
var surgeon = new Codesurgeon;    // make an instance

surgeon
  .configure({                    // lets add some configuration options!
    quiet: true,                  // don't output the status of each task
    package: '../package.json'    // read my package.json and use it for version numbers etc.
  })
  .read('/*.js')                  // add one or more files to add to the buffer
  .extract(                       // specify the names in the order we want them to be compiled
    'B',
    'a'
  )
  .write(__dirname + '/dest.js'); // write the buffer to a file
```

## Asynchronous example
Read and write methods can be used asynchronously by adding a callback!

```js
  surgeon
    .configure({
      quiet: true,
      package: '../package.json'
    })
    .read(
      '/*.js',
      function() { // callback to fire after reading...

        //
        // calling `extract` without parameters would extract everything from the buffer.
        //
        this.extract(
          'B', 
          'a'
        );

        this.write(__dirname + '/dest.js');

      }
    );
```

### Source file

```js
function A() { return 'A'; }
function B() { return 'B'; }
var a = 100 + 100;
var b = 100 + 100;
function C() { return 'C'; }
```

### Destination File 
Uses the specified `package.json` to add a header and change the filename to include the version number.

```js
//
// Generated on Thu Sep 29 2012 12:29:42 GMT-0400 (EDT) by Codesurgeon.
// Version 0.1.6
//

function B() { return 'B'; }
var a = 100 + 100;
```

## Extract-Code-As
It is easy to change the name of an item that is extracted!

```js
surgeon
  .read(
    '/dummy1.js', 
    '/dummy2.js'
  )
  .extract(
    'A',
    ['C', 'D'] // rename the item (works with dot notation too)
  );
```

### Destination File

```js
//
// Generated on Thu Sep 29 2011 12:29:42 GMT-0400 (EDT) by Codesurgeon.
// Version 0.1.6
//
function A() { return 'A'; }
function D() { return 'C'; } // this has been renamed
```

## Automatic Wrapping
When compiling a script that will be used in multiple environments, you often want to wrap the code in a closure that will detect the correct environment and pass it in.

### Source file

```js
function A() { ... }
```

### Destination file
Contains a closure that is passed the object relevant to the environment. See the API reference below to change the arguments or detection expression.

```js
(function(exports) {
  function A() { ... }
}(typeof process !== "undefined" && process.title ? module : window));

```

# API

## Constructor
The constructor function provides an instance of the Codesurgen.

### Codesurgeon(conf)
```
  function Codesurgeon(conf)
  
  @param conf {Object} a json object literal that can contain configuration options.
    @member encoding {String} the encoding that will be used to product the result.
    @member quiet {String} indicate how much logging you want Codesurgen to produce.
    @member noVersion {Boolean} true if you don't want Codesurgeon to automatically version your output filename.
```

## Instance Methods

### configure(conf)
Allows you to pass configuration settings to the instance, helpful as you chain together methods.

```
  function configure(conf)
  
  @param conf {Object} a json object literal that can contain configuration options.
```

### package(path)
Capture package details of a `package.json` file. Used in concert with the `write` method. The write method will attempt to read the file and 

```
  function package(path)
  
  @param path {String} a path to a valid `package.json` file.
```

### read(...files)
Read one or more files from disk. Accepts wild cards in the filename, eg. `*-foo.js`.

```
  function read(file [, file, ...])
  
  @param file {String} a string that represent the locations of a file.
```

### clear(buffer)
Provides the means to clear the input and or output buffers before the next read and write.

```
  function clear(buffer)
  
  @param buffer {String} The buffer to be cleared, `input`, `output` or `both`.
```

### wrap(options)
Wraps the code in a closure.

```
  function wrap(conf)
  
  @param conf {Object} a json object literal that can contain configuration options.
  
  @param outer {String} code that will be appended outside of the closure.
  
  @param before {String} a string of code to prepend to the body of the closure.
  
  @param after {String} a string of code to append to the body of the closure.
  
  @param params {String} the parameters that you want to pass to the closure
  
  @param signature {String} the method signature (parameters that go inside the closure's 
  parenthesis e.g. `function(foo, bar, bazz)` where "foo, bar, bazz" is the signature).
```

### extract(...name) // WITHOUT PARAMETERS WILL EXTRACT EVERYTHING
Specifies the names of the items that you would like to extract from the input buffer. You can specify a simple variable or function name such as `myMethod` or you can be specific about the item you are looking for, e.g. `MyConstructor.prototype.foo`. This is helpful in the case where you have another method named `foo` that might occur beforehand, e.g. `OtherConstructor.prototype.foo`.

```
  function extract(name [, name, ...])
  
  @param name {String} a series of strings that represent the items that can be found in the code that has been read by the `read` method.
```

### exclude(...name) // WITHOUT PARAMETERS WILL EXCLUDE EVERYTHING
Specifies the names of the items that you would like to exclude from whatever was extracted.

```
  function exclude(name [, name, ...])
  
  @param name {String} a series of strings that represent the items that can be found in the code that has been extracted by the `extract` method.
```

### write(file)
Write the output to a file.

```
  function write(file)
  
  @param file {String} a file name that will be created or overwritten.
```

### append(file)
Write the output to a file.

```
  function append(file)
  
  @file {String} a file name that will be appended to.
```

### uglify(conf)
Compacts and/or obfuscates the code.

```
  function uglify(conf)
  
  @param conf {Object} a json object literal that can contain configuration options.
  
    @member squeeze {String} Applies various compression techniques. It expects an AST 
    (as returned by parse-js) and returns a new, compatible AST (possibly sharing 
    structure with the original one!).
    
    @member mangle {String} This option is careful not to affect the semantics of the code. 
    It will avoid renaming undeclared variables (which could possibly be defined in some 
    other script), and avoid renaming names that are under the influence of a with block, 
    or within the context of an eval call.
```

### lint(conf)
Provides strict javascript validation according to Duglass Crockford's JSLint specification (https://github.com/douglascrockford/JSLint)

```
  function lint(success [, fail, options])
  
  @param success {Function} a callback that will be executed if the code passed the requirements 
  of the lint parser.

  @param fail {Function} optional, a callback that will be executed if the code failed the 
  requirements of the lint parser.

  @param options {Object} optional, an object literal containing the options that are supported 
  by the parser.
```

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

### hint()
Less Strict javascript validation according to JSHint, a community-driven tool to detect errors in JavaScript code. (https://github.com/jshint)

```
  function hint(success [, fail, options])
  @param success {Function} a callback that will be executed if the code passed the requirements 
  of the lint parser.
  
  @param fail {Function} optional, a callback that will be executed if the code failed the 
  requirements of the lint parser.
  
  @param options {Object} optional, an object literal containing the options that are supported 
  by the parser.
```

# License
(The MIT License)

Copyright (c) 2010 hij1nx <http://www.twitter.com/hij1nx>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
