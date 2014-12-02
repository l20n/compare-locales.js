'use strict';

var path = require('path');
var Promise = require('promise');
var Langpack = require('../../langpack').Langpack;
var utils = require('../../utils');
var IniParser = require('./iniparser');

function GeckoApp(path) {
  this.path = path;
  this.sourceLocale = 'en-US';
  this.apps = {};
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
      (this._resources = collectResourceIds(this.path, this.sourceLocale)));
  }.bind(this));
};

GeckoApp.prototype.buildResourcePath = function() {
};

/* Helper functions */

function collectResourceIds(sourcePath, sourceLocale) {
  var l10nIniPath = path.join(sourcePath, 'locales', 'l10n.ini');
  collectResourcesFromApp(l10nIniPath);
}

function collectResourcesFromApp(l10nIniPath) {
  return utils.getFileContent(l10nIniPath).then(function(iniSource) {
    var ini = IniParser.parse(iniSource);
  });
}

exports.App = GeckoApp;
