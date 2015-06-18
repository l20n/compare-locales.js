'use strict';

var path = require('path');
var utils = require('./utils');

function Langpack(type, localeCode, basePath) {
  this.type = type;
  this.code = localeCode;
  this.path = basePath;

  this.ignorePattern = /^(CVS|\.svn|\.hg|\.git)$/;
}

Langpack.prototype.collectResources = function() {
  var resPaths = new Promise(function(resolve) {
    var absPaths = utils.lsExclude(this.path, true, this.ignorePattern);

    var res = {};

    absPaths.forEach(function(absPath) {
      var id = path.relative(this.path, absPath);
      res[id] = {
        id: id,
        path: absPath
      };
    }.bind(this));

    resolve(res);
  }.bind(this));

  return this.resources = resPaths;
}

exports.Langpack = Langpack;
