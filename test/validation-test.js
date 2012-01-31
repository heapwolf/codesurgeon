var write = require('nodeunit').testCase;
var Codesurgeon = require('../lib/codesurgeon').Codesurgeon;
var vm = require('vm');
var fs = require('fs');

module.exports = write({

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

  '1. Lint fail (intentionally).': function (test) {
    var surgeon = new Codesurgeon;

    surgeon
      .configure({ quiet: true })
      .read(__dirname + '/fixtures/fixture1.js')
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
      .configure({ quiet: true })
      .read(__dirname + '/fixtures/fixture1.js')
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
      .configure({ quiet: true })
      .read(__dirname + '/fixtures/fixture1.js')
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
      .configure({ quiet: true })
      .read(__dirname + '/fixtures/fixture1.js')
      .extract(
        'NODEJITSU.B', 
        'NODEJITSU.B.prototype.q'
      )
      .hint()
      ;

    test.ok(true, 'Test finished.');
    
    test.expect(1);
    test.done();
  },
  '5. Find prerequisites.': function (test) {

    var surgeon = new Codesurgeon;
    var sandbox = {
      exports: {}
    };

    surgeon
      .configure({ 
        quiet: true,
        package: __dirname + '/../package.json'
      })
      .read(__dirname + '/fixtures/fixture2.js')
      .extract()
      .validate()
      ;

    test.expect(0);
    test.done();
  }
});