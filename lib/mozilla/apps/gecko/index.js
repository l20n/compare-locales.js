'use strict';

var path = require('path');
var Promise = require('promise');
var Langpack = require('../../langpack').Langpack;
var utils = require('../../utils');
var IniParser = require('./iniparser');
var DTDParser = require('../../../format/dtd');

function GeckoApp(path) {
  this.path = path;
  this.sourceLocale = 'en-US';
  this.apps = {};
  this._includes = [];
  this._langpacks = Object.create(null);
}

GeckoApp.resourceFormats = {
  'properties': 'gecko_properties'
};

GeckoApp.prototype.getLangpackFromSource = function() {
  var pathBuilder = this.buildResourcePath.bind(this);

  var lp = new Langpack('Gaia', this.sourceLocale, this.path);
  lp.addResources(pathBuilder, this.getResources());
};

GeckoApp.prototype.getResources = function() {
  return new Promise(function(resolve) {
    resolve(this._resources ||
      (this._resources = this.getResourceIds(this.path, this.sourceLocale)));
  }.bind(this));
};

GeckoApp.prototype.buildResourcePath = function(type, relPath) {
};

GeckoApp.prototype.getResourceIds = function() {
  var l10nIniPath = path.join(this.path, 'locales', 'l10n.ini');
  collectResourcesFromApp(this.path, l10nIniPath).then(function(res) {
   console.log(res);
  });
}

/* Helper functions */

function collectResourcesFromApp(appPath, l10nIniPath) {
  return utils.getFileContent(l10nIniPath).then(
    IniParser.parse.bind(IniParser)).then(
      function(ini) {
        return Promise.all(
          ini.compare.dirs.map(
            getRepoPath.bind(null, appPath, ini.general.depth))
            .map(Function.prototype.apply.bind(collectResourcesFromDir, null))
          );
      }
    ).then(function(resLists) {
      return resLists.reduce(function(a, b) {
        return a.concat(b);
      });
    });
}

function getRepoPath(appPath, depth, resPath) {
    return [resPath, path.join(appPath, 'locales', depth, resPath)];
}

function collectResourcesFromDir(dirName, dirPath) {
  var resPath = path.join(dirPath, 'locales', 'en-US');
  if (!utils.fileExists(resPath)) {
    return [];
  }

  var paths = utils.ls(resPath, true).map(function(p) {
    return [dirName, path.relative(resPath, p)];
  });
  return paths;
}

exports.App = GeckoApp;
