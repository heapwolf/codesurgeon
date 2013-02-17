var fs = require('fs');
var path = require('path');
var esprima = require('esprima');
var escodegen = require('escodegen');
var fstream = require('fstream');
var JSONStream = require('JSONStream');
var Stream = require('stream').Stream;

module.exports = function (options) {

  options = options || {};

  var isExclusive = !!options.exclude;
  var buffer = '';
  var ast = null;
  var stream = new Stream;

  stream.writable = true;
  stream.readable = true;

  stream.write = function(data) {

    buffer += data.toString();
  };

  stream.end = function (data) {

    if (arguments.length) {
      stream.write(data);
    }

    ast = esprima.parse(buffer);

    traverse(ast.body);

    if (isExclusive) {
      stream.emit('data', escodegen.generate(ast));
    }
    stream.writable = false;
  };

  var traverse = function traverse(ast) {

    ast.forEach(function(item, index) {

      if (item.body) {
        traverse(item.body);
      }

      var id;

      if (item.declarations) {
        item.declarations.forEach(function(declaration) {
          filter(declaration, index, item, ast);
        })
      }
      else {
        console.log(item);
      }

    });
  }

  var filter = function filter(item, index, parent, ast) {

    if (options.include && 
      item.id &&
      options.include.indexOf(item.id.name) > -1) {

      var result = escodegen.generate(parent || item);
      stream.emit('data', result);
    }
    else if (options.exclude &&
      item.id &&
      options.exclude.indexOf(item.id.name) !== -1) {

      ast.splice(index, 1);
    }
  }

  return stream;
};
