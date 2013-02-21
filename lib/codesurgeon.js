var esprima = require('esprima');
var escodegen = require('escodegen');
var Stream = require('stream').Stream;

exports.filter = function (options) {

  options = options || {};

  var debug = true;

  if (typeof options.debug === 'boolean') {
    debug = options.debug;
  }
  
  var buffer = '';
  var ast = null;
  var code = null;
  var stream = new Stream;

  stream.writable = true;
  stream.readable = true;

  stream.exclusive = false;

  stream.syntax = {};

  stream.write = function(data) {

    buffer += data.toString();
  };

  stream.end = function (data) {

    if (arguments.length) {
      stream.write(data);
    }

    ast = esprima.parse(buffer);

    traverse(ast.body);

    code = escodegen.generate(ast);

    stream.emit('data', code);

    stream.writable = false;
    stream.emit('end', code);
  };

  var traverse = function traverse(ast) {

    if (ast.body) {
      traverse(ast.body);
    }

    if (Array.isArray(ast)) {

      ast.forEach(function(item, index) {

        if (item.body || item.declarations) {
          traverse(item.body || item.declarations);
        }

        var id = (item.id && item.id.name) || null;

        console.log(item)

        if (stream.syntax[item.type]) {

          var result = stream.syntax[item.type](id, item);

          if ((result && stream.exclusive === true) ||
            !result && stream.exclusive === false) {
            return ast.splice(index, 1);
          }
        }
      });
    }
  };

  return stream;
};
