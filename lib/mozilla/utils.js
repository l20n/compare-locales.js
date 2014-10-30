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
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
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
};

exports.getDocument = function(content) {
  if (!jsdom) {
    jsdom = require('jsdom');
  }
  return new Promise(function (resolve, reject) {
    jsdom.env(content, [], function(errors, window) {
      if (errors) {
        reject(errors);
      } else {
        resolve(window.document);
      }
    });
  });
};

exports.isSubjectToBranding = function(path) {
  return /shared[\/\\]?[a-zA-Z]*[\/\\]?branding/.test(path);
};

exports.zip = function(left, right) {
  var obj = Object.create(null);
  for(var i = 0; i < Math.min(left.length, right.length); i++) {
    obj[left[i]] = right[i];
  }
  return obj;
};
