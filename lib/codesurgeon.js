
var fs = require('fs'),
    colors = require('colors'),
    path = require('path'),
    traverse = require('traverse'),
    uglify = require('uglify-js');

var Codesurgeon = exports.Codesurgeon = function (options) {
  if (!(this instanceof Codesurgeon)) return new Codesurgeon(options);

  options = options || {};

  this.options = {
    encoding: options.encoding || 'utf8',
    quiet: options.quiet || false,
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
    var script;

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
  var before = options.before || '';
  var after = options.after || '';

  this.source = [
    '(function(' + signature + ') {',
    defaults,
    this.source,
    after,
    '})(' + params + ');'
  ].join('');

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
    // Note: I'm not intimately familiar with the structure of the AST
    // I understand the basics but cant seem to find a spec for the data
    // structure, hence this might not be the most ideal way to discover
    // or validate the values within it.
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
            var segment = this.parent.node[1][2];
            var name = segment[segment.length-1];

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
        break;
      }
    });
  });
  return this;
};

//
// ### function write (files)
// Attempts to write to the file with the 
//
Codesurgeon.prototype.write = function (file) {
  !this.options.quiet && console.log('Attempting to write file [' + file.green + ']');
  console.log('>' + this.packageJSON)
  if(this.packageJSON) {
    if(file.substr(-3) === '.js') {
      file = file.slice(0, -3) + '-' + this.packageJSON.version + '.js';
    }
    
    this.output = [ // make a nice header for the new file.
      '//\n',
      '// Generated on ' + (new Date()) + ' by ' + (this.options.owner || 'Codesurgeon.') + '\n',
      '// Version ' + this.packageJSON.version + '\n',
      '//\n\n'
    ].join('') + this.output;
  }

  fs.writeFileSync(file, this.output, this.options.encoding);
  return this;
};

//
// ### function append (files)
// Attempts to write to the file with the 
//
Codesurgeon.prototype.append = function (file) {
  !this.options.quiet && console.log('Attempting to write file [' + file.green + ']');
  fs.writeFileSync(file, save[file], this.options.encoding);
  return this;
};

//
// ### function uglify (options)
// Attempts to convert the output to string and uglify it.
//
Codesurgeon.prototype.uglify = function (options) {
  !this.options.quiet && console.log('Attempting to uglify file [' + file.yellow + ']');
  
  var mangle = !!options.mangle && options.mangle === true;
  var mangle = !!options.squeeze && options.squeeze === true;
  
  var ast = uglify.parser.parse(this.output.toString());

  if(mangle) {
    ast = uglify.uglify.ast_mangle(ast);
  }
  
  if(squeeze) {
    ast = uglify.uglify.ast_squeeze(ast);
  }
  
  this.source = uglify.uglify.gen_code(ast);
  return this;
};
