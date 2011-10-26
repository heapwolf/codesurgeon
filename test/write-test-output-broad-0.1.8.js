

//
// Generated on Wed Oct 26 2011 14:34:06 GMT-0400 (EDT) by Nodejitsu Inc <info@nodejitsu.com>
// Version 0.1.8
//

var test1 = 10 + 10;

module.exports.test2 = function(a, b) {
  return a + b;
};

var NODEJITSU = { A: {}, B: {} }

NODEJITSU.A = function(a, b) {

  var na = 'nested';
  
  return a + b;
};

NODEJITSU.B = function(a, b) {

  var nb = 'nested';
  
  return a + b;
};

NODEJITSU.B.prototype.p = function() {
  s
};

exports.hello = 'Hello, World.';


test3 = 100;
test4 = { test4A: 1 };

function test5() {
  return true;
};

var test6 = function() {
  return String(Date.now())
};

var test7 = function() {
  return 'test7';
}();

var test8 = function test7() {
  return 'test8';  
}();

var test9 = (function() {
  return 'test9';
})();

var test10 = (function() {
  return 'test10';
}());

var test11 = {
  foo: function test9() {}
};