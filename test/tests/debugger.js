var path = require('path')
var fstream = require('fstream')
var cs = require(path.join(__dirname, '..', '..', 'lib', 'codesurgeon'))

module.exports = {

  'Debugger statements should get removed': function(test, next) {

    test.plan(1)

    var input = path.join(__dirname, '..', 'fixtures', 'debuggerStatements.js')
    var output = 'function a() {\n}'

    var filter = cs.filter()

    filter.inclusive = true

    filter.syntax.DebuggerStatement = function(name, item) {
      return false
    }

    fstream
      .Reader(input)
      .pipe(filter)
      .on('end', function(data) {

        test.equal(data, output)
        next()
      })
  }
}
