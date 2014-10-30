'use strict';

var fs = require('fs');
var Path = require('path');
var jsdom;
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
};

exports.readFile = function(path, type) {
  return new Promise(function(resolve, reject) {
    fs.readFile(path, {encoding: type}, function(err, data) {
      return err ? reject(err) :  resolve(data);
    });
  });
};

exports.getFileContent = function(path, type) {
  return exports.readFile(path, type || 'utf-8');
};

exports.splitPath = function(path) {
  return path.split(Path.sep).filter(function(elem) {
    return elem.length;
  });
};

exports.fileExists = function(path) {
  var stat;
  try {
    stat = fs.statSync(path);
  } catch(e) {
  }
  return !!stat;
};

exports.loadJSON = function(path) {
  return exports.readFile(path).then(JSON.parse);
};

exports.getDocument = function(content) {
  if (!jsdom) {
    jsdom = require('jsdom');
  }
  return new Promise(function (resolve, reject) {
    jsdom.env(content, [], function(errors, window) {
      return errors ? reject(errors) : resolve(window.document);
    });
  });
};
