'use strict';

var fs = require('fs');
var jsdom = require("jsdom");
var Promise = require('promise');

exports.ls = function ls(dir, recursive, pattern) {
  var results = [];
  var list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    var stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (recursive) {
        results = results.concat(ls(file, recursive, pattern));
      }
    } else {
      if (!pattern || pattern.test(file)) {
        results.push(file);
      }
    }
  });
  return results;
}

exports.getFileContent = function(path, type) {
  return fs.readFileSync(path, {encoding: type || 'utf-8'});
}

exports.getDocument = function(content) {
  return new Promise(function (resolve, reject) {
    jsdom.env(
      content,
      [],
      function (errors, window) {
        resolve(window.document);
      }
    );
  });
}
