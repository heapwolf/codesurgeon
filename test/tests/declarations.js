var path = require('path')
var fstream = require('fstream')
var cs = require(path.join(__dirname, '..', '..', 'lib', 'codesurgeon'))

module.exports = {

  "Include a single variable declaration": function(test, next) {

    test.plan(1)

    var input = path.join(__dirname, '..', 'fixtures', 'variableDeclarations.js')
    var output = 'var b = 2;'

    var filter = cs.filter()

    filter.syntax.VariableDeclarator = function(name, item) {
      if (name === 'b') {
        return true
      }
    }

    fstream
      .Reader(input)
      .pipe(filter)
      .on('end', function(data) {
        test.equal(data, output)
        next()
      })
  },

  // "Exclude a single variable declaration": function(test, next) {
    
  //   test.plan(1)

  //   var input = path.join(__dirname, '..', 'fixtures', 'variableDeclarations.js')
  //   var output = 'var a = 1;\nvar c = 3;'

  //   var filter = cs.filter()

  //   filter.exclusive = true

  //   filter.syntax.VariableDeclarator = function(name, item) {
  //     if (name === 'b') {
  //       return false
  //     }
  //   }

  //   fstream
  //     .Reader(input)
  //     .pipe(filter)
  //     .on('end', function(data) {
  //       test.equal(data, output)
  //       next();
  //     })
  // },

  // "Include a single function declaration": function(test, next) {

  //   test.plan(1)

  //   var opts = { include: ['b'] }
  //   var result = 'function b() {\n}';
  //   var file = path.join('fixtures', 'functionDeclarations.js')

  //   fstream
  //     .Reader(file)
  //     .pipe(filter(opts))
  //     .on('end', function(data) {
  //       test.equal(data, result)
  //       next()
  //     })
  // }
};





