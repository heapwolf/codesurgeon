var fs = require('fs');
var path = require('path');
var esprima = require('esprima');
var escodegen = require('escodegen');
var fstream = require('fstream');
var JSONStream = require('JSONStream');
var Stream = require('stream').Stream;

module.exports = function (options) {

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

    code = escodegen.generate(ast)

    stream.emit('data', code);

    stream.writable = false;
    stream.emit('end', code);
  };

  var traverse = function traverse(ast) {

    if (ast.body) {
      traverse(ast.body)
    }

    if (Array.isArray(ast)) {

       ast.forEach(function(item, index) {

        if (item.body) {
          traverse(item.body);
        }

        var id = (item.id && item.id.name) || null;

        if (stream.syntax[item.type] &&
          stream.syntax[item.type](id, item) === false) {
          return false;
        }

        switch(item.type) {

          case 'VariableDeclaration':

            if (item.declarations) {
              item.declarations.forEach(function(declaration) {
                filter(declaration, index, ast);
              })
            }
          break;

          case 'VariableDeclarator':
          break;

          case 'FunctionDeclaration':

            if (item.id && item.id.name) {
              filter(item, index, ast);
            }
          break;

          case 'FunctionExpression':
          break;

          case 'DebuggerStatement':
            if (debug === false) {
              ast.splice(index, 1);
            }
          break;

          case 'SwitchCase':
            if (item.id && item.id.name) {
              filter(item, index, ast);
            }
          break;

          //
          // Hmm... what elese.
          //
          case 'AssignmentExpression':
          case 'ArrayExpression':
          case 'ArrayPattern':
          case 'BinaryExpression':
          case 'BreakStatement':
          case 'CallExpression':
          case 'CatchClause':
          case 'ComprehensionBlock':
          case 'ComprehensionExpression':
          case 'ConditionalExpression':
          case 'DirectiveStatement':
          
          case 'EmptyStatement':
          case 'ExpressionStatement':
          case 'FunctionDeclaration':

          case 'Identifier':
          case 'Literal':
          case 'LogicalExpression':
          case 'MemberExpression':
          case 'NewExpression':
          case 'ObjectExpression':
          case 'ObjectPattern':
          case 'Property':
          case 'SequenceExpression':
          case 'ThisExpression':
          case 'ThrowStatement':
          case 'UnaryExpression':
          case 'UpdateExpression':
          
          case 'WhileStatement':
          case 'YieldExpression':
          break;

        }
      });
    }
  };

  var filter = function filter(item, index, ast) {

    if (item.id) {

      if (options.include && 
        options.include.indexOf(item.id.name) < 0) {
        ast.splice(index, 1);
      }
      else if (options.exclude &&
        options.exclude.indexOf(item.id.name) > -1) {

        ast.splice(index, 1);
      }
    }
  };

  return stream;
};
