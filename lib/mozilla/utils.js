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

exports.listDiff = function(list1, list2) {
  var diff = [];

  list1.forEach(function(elem) {
    if (list2.indexOf(elem) !== -1) {
      diff.push([elem, 'both']);
    } else {
      diff.push([elem, 'list1']);
    }
  });

  list2.forEach(function(elem) {
    if (list1.indexOf(elem) === -1) {
      diff.push([elem, 'list2']);
    }
  });
  return diff;
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
