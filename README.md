# SYNOPSIS
Build a subset or superset of a code base.

```bash
$npm install codesurgeon
```

# EXAMPLES

### Input
```js
var a = 10;
var b = 11;
var c = 12;
```

### Code file
```js
var filter = require('codesurgeon');
var opts = { include: ['b'] };

fstream
  .Reader('example.js')
  .pipe(filter(opts))
  .pipe(process.stdout)
;
```

### Output
```js
var b = 11;
```

### Input
```js
var a = 10;
var b = 11;
var c = 12;
```

### Code file
```js
var filter = require('codesurgeon');
var opts = { exclude: ['b'] };

fstream
  .Reader('example.js')
  .pipe(filter(opts))
  .pipe(process.stdout)
;
```

### Output
```js
var a = 10;
var c = 12;
```

# LICENSE
(The MIT License)

Copyright (c) 2010 hij1nx <http://www.twitter.com/hij1nx>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
