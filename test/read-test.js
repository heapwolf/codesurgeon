
var read = require('nodeunit').testCase;
var Codesurgeon = require('../lib/codesurgeon').Codesurgeon;
var vm = require('vm');

module.exports = read({

  setUp: function (test) {
    if (typeof test === 'function') {
      test();
    }
    else {
      test.done();
    }
  },

  tearDown: function (test) {
    if (typeof test === 'function') {
      test();
    }
    else {
      test.done();
    }
  },

  '1. Read files using a wildcard.': function (test) {
    
    var surgeon = new Codesurgeon;
    var sandbox = {};

    surgeon
      .configure({ quiet: true })
      .read(__dirname + '/fixtures/*.js')
      .extract(
        'test12', 'test1'
      )
    ;

    vm.runInNewContext(surgeon.output, sandbox, 'sandbox.vm');
    
    test.ok(sandbox.test12(), 'The function was extracted and executed.');
    test.equal(sandbox.test1, 20, 'The value was extracted and resolved.');

    test.expect(2)
    test.done();

  }

});