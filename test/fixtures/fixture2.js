
var test12 = function() {
  return 12;
};

var test13 = function() { /* ... */ };

var requireanalyzer = require('require-analyzer');
var requireanalyzer = require('jshint');
var Five = require('./fixture5').Five;

notimplemented(); // throws an error.

var five = new Five();
var report = five.whoami();
