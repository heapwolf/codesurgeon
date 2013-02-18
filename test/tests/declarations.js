var path = require('path')
var fstream = require('fstream')
var filter = require(path.join('..', '..', 'lib', 'codesurgeon'))

module.exports = {

  "Include a single variable declaration": function(test, next) {

    test.plan(1)

    var opts = { include: ['b'] }
    var result = 'var b = 2;'
    var file = path.join('fixtures', 'variableDeclarations.js')

    fstream
      .Reader(file)
      .pipe(filter(opts))
      .on('end', function(data) {
        test.equal(data, result)
        next()
      })
  },

  "Exclude a single variable declaration": function(test, next) {
    
    test.plan(1)

    var opts = { exclude: ['b'] }
    var result = 'var a = 1;\nvar c = 3;'
    var file = path.join('fixtures', 'variableDeclarations.js')

    fstream
      .Reader(file)
      .pipe(filter(opts))
      .on('end', function(data) {
        test.equal(data, result)
        next();
      })
  },

  "Include a single function declaration": function(test, next) {

    test.plan(1)

    var opts = { include: ['b'] }
    var result = 'function b() {\n}';
    var file = path.join('fixtures', 'functionDeclarations.js')

    fstream
      .Reader(file)
      .pipe(filter(opts))
      .on('end', function(data) {
        test.equal(data, result)
        next()
      })
  }
};





