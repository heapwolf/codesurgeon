
var fs = require('fs'),
    colors = require('colors'),
    path = require('path'),
    traverse = require('traverse'),
    uglify = require('uglify-js');


//
// Codesurgeon
//
//
var Codesurgeon = exports.Codesurgeon = function (options) {
  if (!(this instanceof Codesurgeon)) return new Codesurgeon(options);

  options = options || {};

  this.options = {
    encoding: options.encoding || 'utf8',
    quiet: options.quiet || false
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

Codesurgeon.prototype.package = function(file) {
  this.packageJSON = JSON.parse(fs.readFileSync(file, 'utf8'));
  return this;
};

Codesurgeon.prototype.read = function () {
  var file;
  for (var i = 0, l = arguments.length; i < l; i++) {
    file = arguments[i];
    !this.options.quiet && console.log('Attempting to read file [' + file.yellow + ']');
    this.inputs[file] = fs.readFileSync(file, 'utf8');
  }
  return this;
};

// ### function wrap (options)
// #### @options {Object} **Optional** Options to wrap the current code with
// ##### @params {String} Allow the user to determine what the closure will
// Wraps the extracted source with a closure.
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
// #### identifiers {...String} a series of string literals denoting identifiers
// Does analysis to find the required members, methods, functions 
// or variables and then writes a new file with the exhumed etc.
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
                that.output += uglify.uglify.gen_code(this.parent.node, true);
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
                that.output += uglify.uglify.gen_code(this.parent.node, true);
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
                that.output += uglify.uglify.gen_code(this.parent.node, true);
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
Codesurgeon.prototype.write = function (file) {
  !this.options.quiet && console.log('Attempting to write file [' + file.green + ']');

  if(this.packageJSON) {
    if(file.substr(-3) === '.js') {
      file = file.slice(0, -3) + '-' + this.packageJSON.version + '.js';
    }
    
    this.output = [ // make a nice header for the new file.
      '//',
      '// Generated on ' + (new Date()) + ' by ' + (this.options.owner || 'Codesurgeon.'),
      '// Version ' + this.packageJSON.version,
      '//\n'
    ].join('\n') + this.output;
  }

  fs.writeFileSync(file, this.output, this.options.encoding);
  this.newfile = file;
  return this;
};

//
// ### function append (files)
// Attempts to append code to an existing file
//
Codesurgeon.prototype.append = function (file) {

  var that = this;
  
  !that.options.quiet && console.log('Attempting to append to file [' + file.yellow + ']');
  
  if(that.packageJSON) {
    if(file.substr(-3) === '.js') {
      file = file.slice(0, -3) + '-' + that.packageJSON.version + '.js';
    }
  }
  
  that.newfile = file;
  
  fs.open(file, 'a', function(err, fd) {
    if(err) {
      return !that.options.quiet && console.log('There was a problem writing to [' + file.red + ']');
    }
    fs.write(fd, '\n\n' + that.output, null, 'utf8', function(err) {
      console.log(err);
      fs.close(fd, function(err){
      console.log(err);
        !that.options.quiet && console.log('Successfully appended to file [' + file.green + ']');
      });
    });
  });

  return that;
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
  return this;
};
