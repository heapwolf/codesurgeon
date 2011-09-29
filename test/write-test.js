var write = require('nodeunit').testCase;
var Codesurgeon = require('../lib/codesurgeon').Codesurgeon;
var vm = require('vm');

module.exports = write({

  setUp: function (callback) {
    callback();
  },

  tearDown: function (callback) {
    callback();
  },

  '1. Extract a method by `simple` name.': function (test) {
    var surgeon = new Codesurgeon;

    var sandbox = {};

    surgeon

      //
      // if we want to see logging information or not.
      //
      .configure({ quiet: true })

      //
      // read one, or a couple of files
      //
      .read(__dirname + '/dummy.js')

      //
      // get one or more methods from the code that we've read in.
      //
      .extract('test5')
      
      .package('../package.json')
      .write('write-test-output.js');

    vm.runInNewContext(surgeon.output, sandbox, 'sandbox.vm');
    
    //test.ok(sandbox.test5(), 'The function was extracted and executed.')
    
    test.expect(0);
    test.done();
  }
});