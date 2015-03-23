'use strict';

var Promise = require('promise');
var path = require('path');
var utils = require('./utils');

function Langpack(type, localeCode, basePath) {
  this.type = type;
  this.code = localeCode;
  this.path = basePath;
}

Langpack.prototype.collectResources = function() {
  var resPaths = new Promise(function(resolve) {
    var typeRe = new RegExp(this.type.getFilePattern() + '$');
    var absPaths = utils.ls(this.path, true, typeRe);

    var res = {};

    absPaths.forEach(function(absPath) {
      var relPath = path.relative(this.path, absPath);
      res[relPath] = {
        id: relPath,
        path: absPath
      };
    }.bind(this));

    resolve(res);
  }.bind(this));

  return this.resources = resPaths;
}

exports.Langpack = Langpack;
