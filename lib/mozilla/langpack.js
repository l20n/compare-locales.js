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

exports.getLangpackFromDir = function(dir, locale) {
  var lp = new Langpack(null, locale, dir);

  var resPaths = utils.ls(dir, true, /\.properties$/);
  resPaths.forEach(function(resPath) {
    var resID = path.relative(dir, resPath);
    var resource = new Resource(resID, resPath);
    lp.resources[resID] = resource;
  });
  return lp;
}

exports.Langpack = Langpack;
exports.Resource = Resource;
