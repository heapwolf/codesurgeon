var extraction = require('nodeunit').testCase;
var Codesurgeon = require('../lib/codesurgeon').Codesurgeon;
var uglify = require('uglify-js');
var vm = require('vm');

module.exports = extraction({

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
      .read(__dirname + '/fixtures/fixture1.js')

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

    var sandbox = {
      NODEJITSU: {}
    };

    surgeon

      //
      // if we want to see logging information or not.
      //
      .configure({ quiet: true })

      //
      // read one, or a couple of files
      //
      .read(__dirname + '/fixtures/fixture1.js')

      //
      // get one or more methods from the code that we've read in.
      //
      .extract(
        'NODEJITSU.B', 
        'NODEJITSU.B.prototype.p'
      );

    vm.runInNewContext(surgeon.output, sandbox, 'sandbox.vm');

    test.ok(sandbox.NODEJITSU.B, 'The function was extracted and executed.')
    test.ok(sandbox.NODEJITSU.B.prototype.p, 'The function was extracted and executed.')

    test.expect(2);
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
      .read(__dirname + '/fixtures/fixture1.js')

      //
      // get one or more methods from the code that we've read in.
      //
      .extract('test1');

    vm.runInNewContext(surgeon.output, sandbox, 'sandbox.vm');

    test.equal(sandbox.test1, 20, 'The variable was extracted and evaluated correctly.');

    test.expect(1);
    test.done();
  },

  '4. Extract a variable from the result of reading in multiple source files.': function (test) {

    var surgeon = new Codesurgeon;
    var sandbox = {};

    surgeon
      .configure({ quiet: true })
      .read(__dirname + '/fixtures/fixture1.js', __dirname + '/fixtures/fixture2.js')
      .extract('test1', 'test12');

    vm.runInNewContext(surgeon.output, sandbox, 'sandbox.vm');

    test.equal(sandbox.test1, 20, 'The variable was extracted and evaluated correctly.');

    test.expect(1);
    test.done();
  },
  
  '5. Extract a variable from the result of reading in multiple source files asyncronously.': function (test) {

    var surgeon = new Codesurgeon;

    var sandbox = { // fake node environment.
      module: { exports: {} },
      exports: {}
    };

    surgeon
      .configure({ quiet: true })
      .read(__dirname + '/fixtures/fixture1.js', __dirname + '/fixtures/fixture2.js', function() {

        this.extract('test1', 'test12');
        
        vm.runInNewContext(this.output, sandbox, 'sandbox.vm');

        test.equal(sandbox.test1, 20, 'The variable was extracted and evaluated correctly.');
        test.equal(sandbox.test12(), 12, 'The function was extracted and evaluated correctly.');
        
        test.expect(2);
        test.done();

      })
    ;
  },
  '6. Extract-As for `simple` and dot notated items.': function (test) {

    var surgeon = new Codesurgeon;
    var sandbox = {
      exports: {}
    };

    surgeon
      .configure({ quiet: true })
      .read(__dirname + '/fixtures/fixture1.js', __dirname + '/fixtures/fixture2.js')
      .extract(
        'test1',
        ['test12', 'bazz12'],
        ['exports.hello', 'exports.foo']
      );

    vm.runInNewContext(surgeon.output, sandbox, 'sandbox.vm');

    test.equal(sandbox.bazz12(), 12, 'The variable was extracted and evaluated correctly.');
    test.equal(sandbox.exports.foo, 'Hello, World.', 'The variable was extracted and evaluated correctly.');

    test.expect(2);
    test.done();
  },
  '7. Extract the value of an arbitrary key from an object literal.': function(test) {
    
    var surgeon = new Codesurgeon;
    var file = __dirname + '/fixtures/fixture6.js';

    surgeon
      .configure({ quiet: true })
      .read(file)
      .extract('b')
      ;

    test.equal(surgeon.output, 200);
    test.expect(1);
    test.done();
  },

  '8. Extract everything and then exlude something.': function(test) {
    
    var surgeon = new Codesurgeon;
    var file = __dirname + '/fixtures/fixture7.js';

    var sandbox = {
      exports: {}
    };

    surgeon
      .configure({ quiet: true })
      .read(file)
      .extract()
      .exclude('second')
      ;

    vm.runInNewContext(surgeon.output, sandbox, 'sandbox.vm');

    test.equal(sandbox.firstFunction(), true, 'The function was extracted and executed correctly.');
    test.equal(sandbox.lastFunction(), true, 'The function was extracted and executed correctly.');
    
    test.expect(2);
    test.done();
  },

  '8. Extract something using a pattern.': function(test) {
    
    var surgeon = new Codesurgeon;
    var file = __dirname + '/fixtures/fixture7.js';

    var sandbox = {
      exports: {}
    };

    surgeon
      .configure({ quiet: true })
      .read(file)
      .extract()
      .exclude(/unction/)
    ;

    vm.runInNewContext(surgeon.output, sandbox, 'sandbox.vm');
    test.equal(sandbox.second(), true, 'The function was extracted and executed correctly.');
    
    test.expect(1);
    test.done();
  }

});

