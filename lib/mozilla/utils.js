'use strict';

var fs = require('fs');
var Path = require('path');
var jsdom;

exports.ls = function ls(dir, recursive, pattern) {
  var results = [];
  var list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = Path.join(dir, file);
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

exports.lsExclude = function lsExclude(dir, recursive, exPattern) {
  var results = [];
  var list = fs.readdirSync(dir);
  list.forEach(function(file) {
    if (exPattern && exPattern.test(file)) {
      return;
    }
    file = Path.join(dir, file);
    var stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (recursive) {
        results = results.concat(lsExclude(file, recursive, exPattern));
      }
    } else {
      results.push(file);
    }
  });
  return results;
};

exports.getDirectories = function(path) {
  var results = [];
  var list = fs.readdirSync(path);
  list.forEach(function(file) {
    file = Path.join(path, file);
    var stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results.push(file);
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

exports.equals = function(x, y) {
  if (x === y) return true;
    // if both x and y are null or undefined and exactly the same

  if (!(x instanceof Object) || !(y instanceof Object)) return false;
    // if they are not strictly equal, they both need to be Objects

  if (x.constructor !== y.constructor) return false;
    // they must have the exact same prototype chain, the closest we can do is
    // test there constructor.

  for (var p in x) {
    if (!x.hasOwnProperty(p)) continue;
      // other properties were tested using x.constructor === y.constructor

    if (!y.hasOwnProperty(p)) return false;
      // allows to compare x[ p ] and y[ p ] when set to undefined

    if (x[p] === y[p]) continue;
      // if they have the same strict value or identity then they are equal

    if (typeof(x[p]) !== "object") return false;
      // Numbers, Strings, Functions, Booleans must be strictly equal

    if (!exports.equals(x[p], y[p])) return false;
      // Objects and Arrays must be tested recursively
  }

  for (p in y) {
    if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) return false;
      // allows x[ p ] to be set to undefined
  }
  return true;
}
