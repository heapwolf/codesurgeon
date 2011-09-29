## Synopsis
A library for precision code extraction. Hack, slash and stitch javascript code using node.

## Motivation
If you have a lot of libraries and need to build distributions of different configurations. This is the tool for you. It doesn't require you to crap up your file with any special syntax it parses the AST to extract your functions.

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
surgeon
  .configure({ // lets add some configuration options!
    quiet: true, // how about you just not say anything for now
    package: '../package.json' // an read my package.json
  })
  .read(__dirname + '/dummy.js') // add one or more files to analyze
  .extract('B') // specify the functions we want
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

## License

## Licence
(The MIT License)

Copyright (c) 2010 hij1nx <http://www.twitter.com/hij1nx>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
