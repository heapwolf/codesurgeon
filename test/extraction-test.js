var extraction = require('nodeunit').testCase;
var Codesurgeon = require('../lib/codesurgeon').Codesurgeon;
var vm = require('vm');

module.exports = extraction({

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
      .extract('test5');

    vm.runInNewContext(surgeon.output, sandbox, 'sandbox.vm');
    
    test.ok(sandbox.test5(), 'The function was extracted and executed.')
    
    test.expect(1);
    test.done();
  },
  
  '2. Extract a method by dot notation.': function (test) {
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
      .extract('NODEJITSU.B');

    vm.runInNewContext(surgeon.output, sandbox, 'sandbox.vm');

    test.ok(sandbox.NODEJITSU.B, 'The function was extracted and executed.')

    test.expect(1);
    test.done();
  },

  '3. Extract a variable.': function (test) {
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
      .extract('test1');

    vm.runInNewContext(surgeon.output, sandbox, 'sandbox.vm');

    test.equal(sandbox.test1, 20, 'The variable was extracted and evaluated correctly.');

    test.expect(1);
    test.done();
  }


});

