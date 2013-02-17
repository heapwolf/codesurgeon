var path = require('path')
var filter = require(path.join('..', 'lib'))

var dir = path.join('fixtures', 'example.js')

module.exports = {

  "Include a single variable declaration": function(test) {
    
    test.plan(1)

    var opts = { include: ['b'] }

    var path = path.join('test', 'fixtures', 'declarations.js')

    fstream
      .Reader(dir)
      .pipe(filter(opts))
      .on('end', function(data) {
        
      })
  }

};