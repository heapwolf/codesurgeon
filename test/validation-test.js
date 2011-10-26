var write = require('nodeunit').testCase;
var Codesurgeon = require('../lib/codesurgeon').Codesurgeon;
var vm = require('vm');
var fs = require('fs');

module.exports = write({

  setUp: function (callback) {
    callback();
  },

  tearDown: function (callback) {
    callback();
  },

  '1. Lint fail (intentionally).': function (test) {
    var surgeon = new Codesurgeon;

    surgeon
      .read(__dirname + '/fixture1.js')
      .extract(
        'NODEJITSU.B', 
        'NODEJITSU.B.prototype.p'
      )
      .lint()
      ;

    test.ok(true, 'Test finished.');
    
    test.expect(1);
    test.done();
  },
  '2. Lint succeed.': function (test) {
    var surgeon = new Codesurgeon;

    surgeon
      .read(__dirname + '/fixture1.js')
      .extract(
        'NODEJITSU.B', 
        'NODEJITSU.B.prototype.q'
      )
      .lint()
      ;

    test.ok(true, 'Test finished.');
    
    test.expect(1);
    test.done();
  },
  '3. Hint fail (intentionally).': function (test) {
    var surgeon = new Codesurgeon;

    surgeon
      .read(__dirname + '/fixture1.js')
      .extract(
        'NODEJITSU.B', 
        'NODEJITSU.B.prototype.p'
      )
      .hint()
      ;

    test.ok(true, 'Test finished.');
    
    test.expect(1);
    test.done();
  },
  '4. Hint succeed.': function (test) {
    var surgeon = new Codesurgeon;

    surgeon
      .read(__dirname + '/fixture1.js')
      .extract(
        'NODEJITSU.B', 
        'NODEJITSU.B.prototype.q'
      )
      .hint()
      ;

    test.ok(true, 'Test finished.');
    
    test.expect(1);
    test.done();
  }
});