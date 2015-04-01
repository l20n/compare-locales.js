'use strict';

var path = require('path');
var utils = require('./utils');

function Langpack(type, localeCode, basePath) {
  this.type = type;
  this.code = localeCode;
  this.path = basePath;

  this._typeRe = new RegExp('\.' + type.getFilePattern() + '$');
}

Langpack.prototype.collectResources = function() {
  var resPaths = new Promise(function(resolve) {
    var absPaths = utils.ls(this.path, true, this._typeRe);

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
