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

  '1. Extract a method by `simple` name and write the contents to a new file.': function (test) {
    var surgeon = new Codesurgeon;

    var sandbox = {};

    surgeon
      .configure({ 
        quiet: true, 
        package: __dirname + '/../package.json' 
      })
      .read(__dirname + '/fixtures/fixture1.js')
      .extract('test5')
      .write(__dirname + '/output/write-test-output.js')
    ;

    var file = fs.readFileSync(surgeon.newfile, 'utf8');
    vm.runInNewContext(file, sandbox, 'sandbox.vm');

    test.ok(sandbox.test5(), 'The function was extracted and executed.')

    test.expect(1);
    test.done();
  },
  
  '2. Extract a method by `simple` name, wrap the contents and write to a new file.': function (test) {
    var surgeon = new Codesurgeon;

    var sandbox = {
      window: {}
    };

    surgeon
      .configure({
        quiet: true,
        package: __dirname + '/../package.json'
      })
      .read(__dirname + '/fixtures/fixture1.js')
      .extract('exports.hello')
      .wrap()
      .write(__dirname + '/output/write-test-output-wrap.js')
    ;

    var file = fs.readFileSync(surgeon.newfile, 'utf8');
    vm.runInNewContext(file, sandbox, 'sandbox.vm');

    test.equal(sandbox.window.hello, 'Hello, World.', 'The function was extracted and executed.')
    
    test.expect(1);
    test.done();
  },

  '3. Extract a method by `simple` name and append the contents to an existing file.': function (test) {
    var surgeon = new Codesurgeon;

    var sandbox = {};

    surgeon
      .configure({ 
        quiet: true, 
        package: __dirname + '/../package.json' 
      })
      .read(__dirname + '/fixtures/fixture1.js')
      .extract('test6')
      .append(__dirname + '/output/write-test-output.js')
    ;

    var file = fs.readFileSync(surgeon.newfile, 'utf8');

    vm.runInNewContext(file, sandbox, 'sandbox.vm');

    test.ok(sandbox.test6(), 'The function was extracted and executed.')

    test.expect(1);
    test.done();
  },
  
  
  '4. Extract a method by `simple` name and append the contents to an existing file asyncronously.': function (test) {
    var surgeon = new Codesurgeon;

    var sandbox = {};

    surgeon
      .configure({ 
        quiet: true, 
        package: __dirname + '/../package.json' 
      })
      .read(__dirname + '/fixtures/fixture1.js')
      .extract('test10')
      .append(__dirname + '/output/write-test-output.js', function() { 

        var file = fs.readFileSync(this.newfile, 'utf8');
        vm.runInNewContext(file, sandbox, 'sandbox.vm');

        test.ok(sandbox.test6(), 'The function was extracted and executed.')

        test.expect(1);
        test.done();

      })
    ;

  },
  
  '5. Uglify output.': function (test) {
    var surgeon = new Codesurgeon;

    var sandbox = {};

    surgeon
      .configure({ 
        quiet: true, 
        package: __dirname + '/../package.json'
      })
      .read(__dirname + '/fixtures/fixture1.js')
      .extract('test5')
      .uglify()
      .write(__dirname + '/output/write-test-output-uglifyd.js')
    ;

    var file = fs.readFileSync(surgeon.newfile, 'utf8');
    vm.runInNewContext(file, sandbox, 'sandbox.vm');

    test.ok(sandbox.test5(), 'The function was extracted and executed.')

    test.expect(1);
    test.done();
  },
    
  '5. Extract everything.': function (test) {
    var surgeon = new Codesurgeon;

    var sandbox = {
      exports: {},
      module: { exports: {} }
    };

    surgeon
      .configure({ 
        quiet: true, 
        package: __dirname + '/../package.json'
      })
      .read(__dirname + '/fixtures/fixture1.js')
      .extract()
      .write(__dirname + '/output/write-test-output-broad.js')
    ;

    var file = fs.readFileSync(surgeon.newfile, 'utf8');
    vm.runInNewContext(file, sandbox, 'sandbox.vm');

    test.ok(sandbox.test5(), 'The function was extracted and executed.')

    test.expect(1);
    test.done();
  }

});

