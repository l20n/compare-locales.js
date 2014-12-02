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

GeckoApp.prototype.buildResourcePath = function() {
};

GeckoApp.prototype.getResourceIds = function() {
  var l10nIniPath = path.join(this.path, 'locales', 'l10n.ini');
  collectResourcesFromApp(this.path, l10nIniPath);
}

/* Helper functions */

function collectResourcesFromApp(appPath, l10nIniPath) {
  return utils.getFileContent(l10nIniPath).then(function(iniSource) {
    var ini = IniParser.parse(iniSource);

    var resDir = ini.compare.dirs[0];

    var repoPath = path.join(appPath, 'locales', ini.general.depth);

    collectResourcesFromDir(path.join(repoPath, resDir));
  });
}

function collectResourcesFromDir(dirPath) {
  var paths = utils.ls(path.join(dirPath, 'locales', 'en-US'), true);
  return paths;
}

exports.App = GeckoApp;
