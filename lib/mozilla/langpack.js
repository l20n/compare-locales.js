'use strict';

var utils = require('./utils.js');
var path = require('path');

function Langpack(uri, localeCode, basePath) {
  this.uri = uri;
  this.code = localeCode;
  this.path = basePath;
  this.type = {
    app: 'gaia',
    structure: 'source'
  };
  this.resources = {};
}

function Resource(id, resPath) {
  this.id = id;
  this.path = resPath;
}

function getLangpackFromDir(path1, locale) {
  var resPaths = utils.ls(path1, true, /\.properties$/);

  return getLangpackFromPaths(resPaths, path1, locale);
}

function getLangpackFromPaths(paths, dir, locale) {
  var lp = new Langpack(null, locale, dir);

  paths.forEach(function(resPath) {
    var resID = path.relative(dir, resPath);
    var resource = new Resource(resID, resPath);
    lp.resources[resID] = resource;
  });
  return lp;
}

exports.Langpack = Langpack;
exports.Resource = Resource;
exports.getLangpackFromDir = getLangpackFromDir;
exports.getLangpackFromPaths = getLangpackFromPaths;
