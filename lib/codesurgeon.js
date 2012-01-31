
var fs = require('fs'),
    colors = require('colors'),
    eyes = require('eyes'),
    path = require('path'),
    tty = require('tty'),
    traverse = require('traverse'),
    jslint = require('jslint-core'),
    jshint = require('jshint'),
    vm = require('vm'),
    uglify = require('uglify-js');

//
// function Codesurgeon()
// @param options {Object} an object literal of configuration values
//
// Traversing the AST can be strange and ugly. There are arrays of arrays of arrays,
// accessing these arrays can casue code to appear fragile. But in fact AST strcutures
// are well known and predictable. Why not make it look nicer by wrapping it in an API? 
// This is already a low level library and the performance cost of a high-level wrapper 
// wouldn't be worth it.
//
var Codesurgeon = exports.Codesurgeon = function (options) {
  if (!(this instanceof Codesurgeon)) return new Codesurgeon(options);

  options = options || {};

  this.options = {
    encoding: options.encoding || 'utf8',
    quiet: options.quiet || false,
    seperator: options.seperator || '\n\n'
  };

  this.inputs = {};
  this.output = '';
};

//
// function clear(option)
// @option option {String} A string that identifies the buffer to be cleared.
//
// Provides the means to clear the input and or output buffers
// before the next read and write.
//
Codesurgeon.prototype.clear = function(option) {
  if (option === 'inputs') {
    this.inputs = {};
  }
  else if (option === 'output') {
    this.output = '';
  }
  else {
    this.inputs = {};
    this.output = '';    
  }
  return this;
};

//
// function configure (options)
// @param options {Object} **Optional** Options to configure this instance with
//
// Configures this instance with the specified `options`.
//
Codesurgeon.prototype.configure = function (options) {
  var that = this;
  Object.keys(options).forEach(function(key) {
    if(key === 'package') {
      return that.package(options[key]);
    }
    that.options[key] = options[key];
  });
  return this;
};

// function package (file)
// @param file {String} A string representing the path to a package.json file.
//
// Read in the package.json file for making the output filename and headers nice.
//
Codesurgeon.prototype.package = function(file) {
  this.packageJSON = JSON.parse(fs.readFileSync(file, 'utf8'));
  return this;
};

// function read (...files)
// @files {...String} One or more strings representing files to be read.
//
// Read one or more files async or sync from which to create output.
//
Codesurgeon.prototype.read = function (files) {
  var file, callback;
  var that = this;
  var i = 0, l = arguments.length;
  var count = l-1;

  if (arguments.length === 1 && typeof arguments[0] === 'function') {
    
    if (!tty.isatty(0)) {

      callback = arguments[0];
      
      process.stdin.resume();
      that.inputs['stdin'] = '';

      process.stdin

        .on('data', function(d) {
          that.inputs['stdin'] += d;
        })

        .on('end', function() {
          callback.call(that, that.inputs['stdin']);
        });

      return that;
    }
  }
  else if (typeof arguments[arguments.length-1] === 'function') {
    callback = arguments[arguments.length-1];
    l--;
  }

  for (i = 0; i < l; i++) {
    file = arguments[i];
    !this.options.quiet && console.log('Read file [' + file.yellow + ']');

    if (callback) {
      fs.readFile(file, this.options.encoding, (function(file) {
        return function(err, data) {
          if(err) {
            !that.options.quiet && console.log(err + ' [' + file.red + ']');
          }

          that.inputs[file] = data + that.options.seperator;
          --count;
          if(count === 0) {
            callback.call(that);
            return that;
          }
        };
      }(file)));
    }
    else {
      this.inputs[file] = fs.readFileSync(file, 'utf8');
    }
  }
  this.lastread = file;
  return this;
};

// function wrap (options)
// @param options {Object} **Optional** Options to wrap the current code with
//  @member params {String} Allow the user to determine what the closure will
//  @member 
//
// Wraps the extracted source with a closure.
//
Codesurgeon.prototype.wrap = function (options) {

  options = options || {};

  var detectionExpression = 'typeof process !== "undefined" && process.title ? module : window';

  var args        = options.arguments || 'exports',
      params      = options.params || detectionExpression,
      outside     = options.outside || '',
      before      = options.before || '',
      after       = options.after || '',
      type        = options.type || 'expression',
      identifier  = options.identifier || 'i' + String(Date.now()),
      instance    = options.instance ? 'new' : '';

  if (type === 'expression') {
    this.output = [
      outside,
      '(function (' + args + ') {',
      before,
      this.output,
      after,
      '}(' + params + '));'
    ].join('\n');
  }
  else if (type === 'declaration') {
    this.output = [
      'var ' + identifier + ' = ' + instance + ' function (' + args + ') {',
      before,
      this.output,
      after,
      '};'
    ].join('\n')
  }

  return this;
};

//
// function extract(identifiers)
// @param identifiers {...String} one of more string literals denoting identifiers.
//
// Does analysis to find the required members, methods, functions 
// or variables and then writes a new file with the exhumed etc.
//
Codesurgeon.prototype.extract = function (identifiers) {

  var inputs = this.inputs;
  var that = this;

  var blob = '';
  var l = arguments.length || 1;
  var args = new Array(l - 1);
  var output = new Array(l - 1);

  for (var i = 0; i < l; i++) args[i] = arguments[i];

  Object.keys(inputs).forEach(function (script) {
    blob += inputs[script];
  });
  
  if(!identifiers) {
    this.output = blob;
    return this;
  }

  var ast = uglify.parser.parse(blob);
  var opts = { indent_level: 4, beautify: true };

  //
  // Note: traverse will walk the AST and discover the entities
  // if there are any that match the high level entities that we
  // are interested in, we'll capture them and copy them into our
  // output buffer.
  //

  traverse(ast).forEach(function(node) {
    switch(node) {
      case 'var':
        //
        // traverse upward again to determine allowed depth.
        // currently only supporting a depth of `toplevel`.
        //
        var level = this.parent.parent.parent.node[0];
        var name = this.parent.node[1][0][0];
        var arg;

        if (level === 'toplevel') {
          for (var i = 0, sl = args.length; i < sl; i++) {
            //
            // TODO 
            // -- warn if multiple found.
            // -- add level check inside this loop.
            //
            arg = args[i];
            
            if (Array.isArray(args[i])) {
              arg = args[i][0];

              for(var j = 0, jl = args[i].length; j < jl; j++) {
                if(typeof args[i][1] === 'string') {
                  this.parent.node[1][0][0] = args[i][1];
                }
              }
            }
            
            if (name === arg) {
              output[i] = uglify.uglify.gen_code(this.parent.node, opts);
            }
          }
        }
      break;
      case 'stat':
        var level = this.parent.parent.parent.node[0];
        if (level === 'toplevel') {
          var segment = this.parent.node[1];

          // exports.A = B => go deeper in assignment
          if (segment[0] === 'assign' && segment[1] === true) {
            segment = segment[2];
          }

          // Traverse segment tree and extract all names
          function getName(segment) {
            if (segment[0] === 'dot') {
              return getName(segment[1]).concat(segment[2]);
            } else if (segment[0] === 'name') {
              return [segment[1]];
            } else {
              return ['!'];
            }
          };

          var chunks = getName(segment),
              name = chunks.join('.'),
              arg,
              newname;

          for (var i = 0, sl = args.length; i < sl; i++) {
            //
            // TODO warn if multiple found.
            //
            arg = args[i];

            if (Array.isArray(args[i])) {
              arg = args[i][0];

              for(var j = 0, jl = args[i].length; j < jl; j++) {
                if(typeof args[i][1] === 'string') {
                  newname = args[i][1].split('.');
                  segment[segment.length-1] = newname[newname.length-1];
                }
              }
            }

            if (name === arg) {
              output[i] = uglify.uglify.gen_code(this.parent.node, opts);
            }
          }

        }
      break;
      case 'defun':
        
        var level = this.parent.parent.parent.node[0];
        
        if (level === 'toplevel') {
          var name = this.parent.node[1];
          var arg;

          for (var i = 0, l = args.length; i < l; i++) {
            // 
            // TODO warn if multiple found.
            // 
            arg = args[i];
            
            if (Array.isArray(args[i])) {
              arg = args[i][0];

              for(var ii = 0, ll = args[i].length; ii < ll; ii++) {
                if(typeof args[i][1] === 'string') {
                  this.parent.node[1] = args[i][1];
                }
              }
            }
            
            if (name === arg) {
              output[i] = uglify.uglify.gen_code(this.parent.node, opts);
            }
          }
        }
      break;
      case 'object':

        var items = this.parent.node[1];
        var arg;

        for (var i = 0, l = args.length; i < l; i++) {

          // 
          // TODO warn if multiple found.
          // 
          arg = args[i];

          for (var ii = 0, ll = items.length; ii < ll; ii++) {
            if (items[ii][0] === arg) {
              output[ii] = uglify.uglify.gen_code(items[ii][1], opts);
              break;
            }
          }

        }

      break;
    }
    
  });


  
  this.output += output.join(that.options.seperator) + that.options.seperator;
  return this;
};

//
// function write (files)
// 
// Attempts to write to the file with the output buffer.
//
Codesurgeon.prototype.write = function (file, callback, flags) {

  var that = this;
  !this.options.quiet && console.log('Write file [' + file.green + ']');

  if(this.packageJSON) {
    if(file.substr(-3) === '.js') {

      //
      // assume that the part of the name before the first dot is the name
      // capture that and preserve the rest to append after we add the version.
      //
      var realName = file.replace(/(\.\.\/)/g, '   ');
      realName = realName.replace(/(\.\/)/g, '  ');

      var name = file.substr(0, realName.indexOf('.'));
      var extras = file.substr(realName.indexOf('.'), realName.length);
      file = name + '-' + this.packageJSON.version + extras;
    }

    var owner = this.options.owner || this.packageJSON.author || 'Codesurgeon.';

    this.output = [ // make a nice header for the new file.
      '//',
      '// Generated on ' + (new Date()) + ' by ' + owner,
      '// Version ' + this.packageJSON.version,
      '//\n'
    ].join('\n') + this.output;
  }

  //
  // if there is a callback, this must be a asyncronous call, 
  // so open, write and close the file and alter the user of errors.
  //
  if(callback) {

    fs.open(file, flags || 'w', function(err, fd) {
      if(err) {
        !that.options.quiet && console.log(err + ' [' + file.red + ']');
      }
      fs.write(fd, '\n\n' + that.output, null, 'utf8', function(err) {
        if(err) {
          !that.options.quiet && console.log(err + ' [' + file.red + ']');
        }
        fs.close(fd, function(err){
          if(err) {
            !that.options.quiet && console.log(err + ' [' + file.red + ']');
          }
          else {
            !that.options.quiet && console.log('Write file [' + file.green + ']');
          }
          
          callback.call(that);
          return that;
        });
      });
    });
  }
  else {

    var fd = fs.openSync(file, flags || 'w');
    var data = fs.writeSync(fd, '\n\n' + this.output);
    fs.closeSync(fd);
  }
  this.newfile = file;
  return this;
};

//
// function append(file)
// @param files {String} represents a path to a file
//
// Attempts to append code to an existing file
//
Codesurgeon.prototype.append = function (file, callback) {

  this.write(file, callback, 'a');
  return this;
};

//
// function uglify (options)
// @oparam ptions {Object} configuration options for unglification.
//
// Attempts to uglify the output and make it available prior to write..
//
Codesurgeon.prototype.uglify = function (options) {

  !this.options.quiet && console.log('Uglify code.');
  
  options = options || {};
  
  var mangle = !!options.mangle === false || options.mangle;
  var squeeze = !!options.squeeze === false || options.squeeze;
  
  var ast = uglify.parser.parse(this.output);

  if(mangle) {
    ast = uglify.uglify.ast_mangle(ast);
  }
  
  if(squeeze) {
    ast = uglify.uglify.ast_squeeze(ast);
  }
  
  this.output = uglify.uglify.gen_code(ast);
  return this;
};

//
// function addreqs(options)
// @param options {Object} an object literal of configuration options.
//
// try to run the code, hijack the require function and try to aquire 
// the complete code necessary to run the program.
//
Codesurgeon.prototype.validate = function(options, output) {

  var that = this;
  var requirements = [];

  var sandbox = {

    //
    // hijack the require function.
    //
    require: function(s) {

      //
      // if we find a path to a local file, try to read the file,
      // add its contents to the output buffer and the recurse into
      // addreqs again in case there are new requirements inside the
      // expanded buffer.
      //
      if(s[0] === '.' || ~s.indexOf('/')) {

        !that.options.quiet && console.log('A module was required, but not inlined to the buffer [' + s.red + ']');

        //
        // inlining the code presents two problems, 1. the filename which i think we can deduce from
        // the last read file (provided as `that.lastfile`). 2. the module has several ways to export
        // so it may be `this`, `module.exports`, `exports`, etc. Here's one potential solution...
        //


        // var lastpath = that.lastread.substr(0, that.lastread.lastIndexOf('/')+1);

        //
        // this obviously does not work, could possibly stat for the file in the same order that
        // node tries to search for it.
        //
        // var fileandpath = lastpath + s + '.js';
        // that.read(fileandpath);

        // var requirement = new RegExp('\\(?require\\)?\\s*\\([\\\'|"]' + s + '[\\\'|"]\\)');
        // var wrappedcode = '(function(module) { \n\n' + that.inputs[fileandpath] + '\n\n return module; })()';

        // that.output = that.output.replace(requirement, wrappedcode);

      }
      //
      // this is a requirement for a module not a file, we can add it
      // to the requirements path.
      //
      else {
        requirements.push(s);
        require(s);
      }
    }
  };

  //
  // attempt to run the code in a new context, its ok
  // for errors to occur, we'll just report them to the
  // user. We hijack the require function and push the
  // module name to an array that we can use to build
  // up our unknown dependencies list.
  //
  try {
    vm.runInNewContext(output || this.output, sandbox, 'tmp.vm');
  }
  catch(ex) {
    !that.options.quiet && console.log('An error occured while executing the code in the ouput buffer [', ex.message.red, ']');
  }

  //
  // remove any known requirements and add any new 
  // requirements that are found in the output code.
  //
  requirements.forEach(function(dep, i) {
    if(that.packageJSON.dependencies[dep]) {
      requirements.splice(i, 1);
    }
    else {
      that.packageJSON.dependencies[dep] = '*';
    }
    
  });

  //
  // tell the user we found some unique requirements from
  // out analysis of the output buffer.
  //
  !that.options.quiet && console.log('Able to add the following modules to the package.json [', requirements.join(', ').green, ']');

  //
  // we now have an updated dependencies member in the package.json 
  // structure, we could possibly rewrite the file depending on the
  // options that the user has chosen.
  //
  // console.log(this.packageJSON.dependencies)

  return this;
};

//
// function hint(success, [, fail, options])
// @param success {Function} a callback that will be executed when the validator yields success.
// @param fail {Function} a callback that will be executed when the validator yields failure.
// @param options {Object} an object literal containing the options that are supported by the parser.
//
// a less strict javascript validator.
//
Codesurgeon.prototype.hint = function(success, fail, options) {

  if(typeof fail !== 'function') {
    option = fail;
  }

  var valid = jshint.JSHINT(this.output, options);

  if(valid === false && !this.options.quiet) {
    console.log('Hint fail!');
    eyes.inspect(jshint.JSHINT.errors);
    fail && fail.call(this);
  }
  else {
    success && success.call(this);
  }
  return this;
};

//
// function lint(success [, fail, options])
// @param success {Function} a callback that will be executed when the validator yields success.
// @param fail {Function} a callback that will be executed when the validator yields failure.
// @param options {Object} an object literal containing the options that are supported by the parser.
//
// a very strict javascript validator.
//
Codesurgeon.prototype.lint = function(success, fail, options) {

  if(typeof fail !== 'function') {
    option = fail;
  }

  var valid = jslint.JSLINT(this.output, options);

  if(valid === false && !this.options.quiet) {
    console.log('Lint fail!');
    eyes.inspect(jslint.JSLINT.errors);
    fail && fail.call(this);
  }
  else {
    success && success.call(this);
  }
  return this;
};
