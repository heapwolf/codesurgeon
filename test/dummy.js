
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
  
}();

var test8 = function test7() {
  
}();

var test9 = (function() {
  
})();

var test10 = (function() {
  
}());

var test11 = {
  foo: function test9() {}
};