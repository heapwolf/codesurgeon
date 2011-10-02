
var fs = require('fs'),
    colors = require('colors'),
    path = require('path'),
    traverse = require('traverse'),
    uglify = require('uglify-js');

//
// Codesurgeon
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
  return this;
};

//
// ### function configure (options)
// #### @options {Object} **Optional** Options to configure this instance with
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

// ### function package (file)
// ##### @file {String} A string representing the path to a package.json file.
// Read in the package.json file for making the output filename and headers nice.
//
Codesurgeon.prototype.package = function(file) {
  this.packageJSON = JSON.parse(fs.readFileSync(file, 'utf8'));
  return this;
};

// ### function read (...files)
// ##### @files {...String} One or more strings representing files to be read.
// Read one or more files async or sync from which to create output.
//
Codesurgeon.prototype.read = function (files) {
  var file, callback;
  var that = this;
  var i = 0, l = arguments.length;
  var count = l-1;

  if(typeof arguments[arguments.length-1] === 'function') {
    callback = arguments[arguments.length-1];
    l--;
  }

  for (i = 0; i < l; i++) {
    file = arguments[i];
    !this.options.quiet && console.log('Attempting to read file [' + file.yellow + ']');

    if(callback) {
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
  return this;
};

// ### function wrap (options)
// #### @options {Object} **Optional** Options to wrap the current code with
// ##### @params {String} Allow the user to determine what the closure will
// Wraps the extracted source with a closure.
//
Codesurgeon.prototype.wrap = function (options) {
  options = options || {};

  var signature = options.signature || 'exports';
  var params = options.params || 'window';
  var outside = options.outside || '';
  var before = options.before || '';
  var after = options.after || '';

  this.output = [
    outside,
    '(function(' + signature + ') {',
    before,
    this.output,
    after,
    '}(' + params + '));'
  ].join('\n');

  return this;
};

//
// ### function extract(identifiers)
// #### identifiers {...String} one of more string literals denoting identifiers.
// Does analysis to find the required members, methods, functions 
// or variables and then writes a new file with the exhumed etc.
//
Codesurgeon.prototype.extract = function (identifiers) {

  var inputs = this.inputs;
  var that = this;

  var l = arguments.length;
  var args = new Array(l - 1);
  for (var i = 0; i < l; i++) args[i] = arguments[i];

  Object.keys(inputs).forEach(function (script) {
    var ast = uglify.parser.parse(inputs[script]);
    
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
          if (level === 'toplevel') {
            for (i = 0, sl = args.length; i < sl; i++) {

              //
              // TODO warn if multiple found.
              //
              if (this.parent.node[1][0][0] === args[i]) {
                that.output += uglify.uglify.gen_code(this.parent.node, true) + that.options.seperator;
              }
            }
          }
        break;
        case 'stat':
          var level = this.parent.parent.parent.node[0];
          if(level === 'toplevel') {
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
                name = chunks.join('.');

            for (i = 0, sl = args.length; i < sl; i++) {
              // 
              // TODO warn if multiple found.
              // 
              if (name === args[i]) {
                if (chunks.length > 2) {
                  chunks.slice(1).reduce(function (acc, name) {
                    return acc + '.' + name;
                  });
                }
                that.output += uglify.uglify.gen_code(this.parent.node, true) + that.options.seperator;
              }
            }
            
          }
        break;
        case 'defun':
          var level = this.parent.parent.parent.node[0];
          if(level === 'toplevel') {
            var name = this.parent.node[1];
            
            for (i = 0, sl = args.length; i < sl; i++) {
              // 
              // TODO warn if multiple found.
              // 
              if (name === args[i]) {
                that.output += uglify.uglify.gen_code(this.parent.node, true) + that.options.seperator;
              }
            }
          }
        break;
        case 'block':
          // not yet used.
        break;
      }
    });
  });
  return this;
};

//
// ### function write (files)
// Attempts to write to the file with the output buffer.
//
Codesurgeon.prototype.write = function (file, callback, flags) {
  var that = this;
  !this.options.quiet && console.log('Attempting to write file [' + file.green + ']');

  if(this.packageJSON) {
    if(file.substr(-3) === '.js') {
      var name = file.substr(0, file.indexOf('.'));
      var extras = file.substr(file.indexOf('.'), file.length);
      file = name + '-' + this.packageJSON.version + extras;
    }
    
    this.output = [ // make a nice header for the new file.
      '//',
      '// Generated on ' + (new Date()) + ' by ' + (this.options.owner || 'Codesurgeon.'),
      '// Version ' + this.packageJSON.version,
      '//\n'
    ].join('\n') + this.output;
  }

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
            !that.options.quiet && console.log('Successfully appended to file [' + file.green + ']');
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
// ### function append (files)
// Attempts to append code to an existing file
//
Codesurgeon.prototype.append = function (file, callback) {
  this.write(file, callback, 'a');
  return this;
};

//
// ### function uglify (options)
// #### @options {Object} configuration options for unglification.
// Attempts to uglify the output and make it available prior to write..
//
Codesurgeon.prototype.uglify = function (options) {
  !this.options.quiet && console.log('Attempting to uglify file [' + file.yellow + ']');
  
  var mangle = !!options.mangle === false || options.mangle;
  var mangle = !!options.squeeze === false || options.squeeze;
  
  var ast = uglify.parser.parse(this.output);

  if(mangle) {
    ast = uglify.uglify.ast_mangle(ast);
  }
  
  if(squeeze) {
    ast = uglify.uglify.ast_squeeze(ast);
  }
  
  this.source = uglify.uglify.gen_code(ast);
  this.ugligied = true;
  return this;
};
