'use strict';

var Promise = require('promise');
var path = require('path');
var utils = require('./utils');

function Langpack(uri, localeCode, basePath) {
  this.uri = uri;
  this.code = localeCode;
  this.path = basePath;
  this.type = 'gaia';
}

var patterns = {
  'extension': /\.(properties|l20n)$/
};

Langpack.prototype.addResources = function(pathBuilder, resources) {
  if (!resources) {
    var resPaths = new Promise(function(resolve) {
      var absPaths = utils.ls(this.path, true, patterns.extension);
      var res = [];

      absPaths.forEach(function(relPath) {
        res.push(pathBuilder(path.relative(this.path, relPath)));
      }, this);
      resolve(res);
    }.bind(this));
    
    return this.resources = resPaths;
  } else {
    return this.resources = resources;
  }
}

/*Langpack.prototype.addResources = function(pathBuilder, resources) {
  var loc = this.code;

  return this.resources = resources.then(function(relPaths) {
    var resources = Object.create(null);
    relPaths.forEach(function(relPath) {
      var resId = relPath;
      if (relPath.indexOf('{locale}') === -1) {
        resId = resId.replace(patterns.extension, '.{locale}.$1');
      }
      var resPath =
        pathBuilder(loc ? relPath.replace('{locale}', loc) : relPath);
      if (utils.fileExists(resPath) &&
          path.basename(resPath) !== 'manifest.properties' &&
          !/branding\/official/.test(resPath)) {
        resources[resId] = new Resource(resId, resPath);
      }
    });
    return resources;
  });
};*/

function getLangpackFromDir(path1, locale) {
  var relative = path.relative.bind(null, path1);
  // XXX imitate an async utils.ls
  var resPaths = new Promise(function(resolve) {
    var absPaths = utils.ls(path1, true, patterns.extension);
    resolve(absPaths.map(relative));
  });

  return getLangpackFromPaths(resPaths, path1, locale);
}

function getLangpackFromPaths(paths, dir, locale) {
  var pathBuilder = path.resolve.bind(null, dir);

  var lp = new Langpack(null, locale, dir);
  lp.addResources(pathBuilder, paths);
  return lp;
}

exports.Langpack = Langpack;
exports.getLangpackFromDir = getLangpackFromDir;
exports.getLangpackFromPaths = getLangpackFromPaths;
