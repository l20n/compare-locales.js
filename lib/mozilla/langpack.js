'use strict';

var Promise = require('promise');
var path = require('path');
var utils = require('./utils');

function Langpack(type, localeCode, basePath) {
  this.type = type;
  this.code = localeCode;
  this.path = basePath;
}

var patterns = {
  'extension': /\.(properties|l20n)$/
};

Langpack.prototype.collectResources = function() {
  var resPaths = new Promise(function(resolve) {
    var typeRe = new RegExp(this.type.getFilePattern() + '$');
    var absPaths = utils.ls(this.path, true, typeRe);

    var res = absPaths.map(path.relative.bind(null, this.path));

    resolve(res);
  }.bind(this));
  
  return this.resources = resPaths;
}

Langpack.prototype.getResourcesPaths = function() {
  return this.resources.then(function(relPaths) {
    var res = {};
    relPaths.forEach(function(relPath) {
      res[relPath] = {
        id: relPath,
        path: path.join(this.path, relPath)
      };
    }.bind(this));
    return res;
  }.bind(this));
}

exports.Langpack = Langpack;
