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
  this._modules = null;
}

GeckoApp.resourceFormats = {
  'properties': 'gecko_properties',
  'dtd': 'gecko_dtd'
};

GeckoApp.prototype.hooks = [
];

GeckoApp.getLangpackFromDir = function(path, locale) {
  var pathBuilder = this.buildResourcePath.bind(this);

  var lp = new Langpack('Gecko', locale, path);
  lp.addResources(pathBuilder);
  return lp;
}

GeckoApp.prototype.getLangpackFromDir = function(dirPath, locale) {
  return this.getModules().then(function(modules) {
    var pathBuilder = this.buildResourcePath.bind(this);
    var lp = new Langpack('Gecko', locale, path);
    lp.addResources(pathBuilder, this.getResourcesFromDir(dirPath));
    return lp;
  }.bind(this));
}

GeckoApp.prototype.getLangpackFromSource = function() {
  return this.getModules().then(function(modules) {
    var pathBuilder = this.buildResourcePath.bind(this);
    var lp = new Langpack('Gecko', this.sourceLocale, this.path);
    lp.addResources(pathBuilder, this.getResources());
    return lp;
  }.bind(this));
};

GeckoApp.prototype.getResources = function() {
  return this._resources || (this._resources =
    this.getResourcesFromSource());
};

GeckoApp.prototype.buildResourcePath = function(relPath) {
  return relPath;
};

GeckoApp.prototype.getResourcesFromSource = function() {
  return this._modules.then(function(modules) {
    var resList = {};

    modules.forEach(function(modulePath) {
      var locPath = path.join(modulePath[1], 'locales', 'en-US');
      var resIds = utils.ls(locPath, true).map(function(p) {
        return {id: modulePath[0] + ':' + path.relative(locPath, p),
                path: path.join(modulePath[1], 'locales', 'en-US', path.relative(locPath, p))};
      }.bind(this));

      resIds.forEach(function(resId) {
        resList[resId.id] = resId;
      });
    }, this);
    return resList;
  }.bind(this));
};

GeckoApp.prototype.getResourcesFromDir = function(dirPath) {
  return this._modules.then(function(modules) {
    var resList = [];

    modules.forEach(function(modulePath) {
      var locPath = path.join(dirPath, modulePath[0]);
      
      var resIds = utils.ls(locPath, true).map(function(p) {
        return {id: modulePath[0] + ':' + path.relative(locPath, p),
                path: path.join(dirPath, modulePath[0], path.relative(locPath, p))};
      }.bind(this));
      resIds.forEach(function(resId) {
        resList[resId.id] = resId;
      });
    }, this);
    return resList;
  }.bind(this));
};

GeckoApp.prototype.getModules = function() {
  return this._modules || (this._modules = 
    collectModules(this.path, 'l10n.ini'));
}

/* Helper functions */


function collectModules(appPath, l10nIniPath) {
  var absPath = path.join(appPath, 'locales', l10nIniPath);
  return utils.getFileContent(absPath).then(
    IniParser.parse.bind(IniParser)).then(
      collectResourcesFromDirsAndIncludes.bind(null, appPath)).then(
        concatResLists);
}

function collectResourcesFromDirsAndIncludes(appPath, ini) {
  return Promise.all([
    collectResourcesFromDirs(appPath, ini).then(concatResLists),
    collectResourcesFromIncludes(appPath, ini).then(concatResLists)]);
}

function collectResourcesFromDirs(appPath, ini) {
  return Promise.all(
    ini.compare.dirs.split(' ').map(
      getRepoPath.bind(null, appPath, ini.general.depth)).map(
        Function.prototype.apply.bind(collectResourcesFromDir, null)));
}

function collectResourcesFromIncludes(appPath, ini) {
  var includedInis = [];
  for (var name in ini.includes) {
    var iniPath = path.join(ini.general.depth, ini.includes[name]);
    includedInis.push(collectModules(appPath, iniPath));
  }

  return Promise.all(includedInis);
}

function concatResLists(resLists) {
  return resLists.reduce(function(seq, list) {
    return seq.concat(list);
  }, []);
}

function getRepoPath(appPath, depth, resPath) {
    return [resPath, path.join(appPath, 'locales', depth, resPath)];
}

function collectResourcesFromDir(dirName, dirPath) {
  if (!utils.fileExists(dirPath)) {
    return [];
  }

  return [[dirName, dirPath]];
}

exports.App = GeckoApp;
