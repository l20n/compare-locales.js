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
  return this._resources || (this._resources =
    this.getResourceIds(this.path, this.sourceLocale));
};

GeckoApp.prototype.buildResourcePath = function(type, relPath) {
};

GeckoApp.prototype.getResourceIds = function() {
  return collectResourcesFromIni(this.path, 'l10n.ini').then(function(res) {
   console.log(res);
  });
};

/* Helper functions */

function collectResourcesFromIni(appPath, l10nIniPath) {
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
    includedInis.push(collectResourcesFromIni(appPath, iniPath));
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
