'use strict';

var path = require('path');
var Promise = require('promise');
var utils = require('../../utils');
var Langpack = require('../../langpack').Langpack;

function GaiaApp(path) {
  this.path = path;
  this.sourceLocale = 'en-US';
  this.apps = {};
  this._langpacks = Object.create(null);
}

GaiaApp.resourceFormats = {
  'l20n': 'l20n',
  'properties': 'gaia_properties'
};

GaiaApp.prototype.hooks = [
  ['compare-entries', require('./placeables')],
  ['compare-entries', require('./spellcheck')],
];

GaiaApp.prototype.getLangpackFromSource = function() {
  var pathBuilder = this.buildResourcePath.bind(this);

  var lp = new Langpack('Gaia', this.sourceLocale, this.path);
  lp.addResources(pathBuilder, this.getResources());
  return lp;
};

GaiaApp.prototype.getResources = function() {
  return new Promise(function(resolve) {
    resolve(this._resources ||
      (this._resources = collectResourceIds(this.path, this.sourceLocale)));
  }.bind(this));
};

GaiaApp.prototype.buildResourcePath = function(relResPath) {
  var pathChunks = utils.splitPath(relResPath);

  if (pathChunks[0] === 'apps') {
    if (pathChunks[1] === 'communications') {
      pathChunks.splice(3, 0, 'locales');
    } else if (pathChunks[1] === 'system') {
      pathChunks.splice(pathChunks.length - 1 , 0, 'locales');
    } else {
      pathChunks.splice(2, 0, 'locales');
    }
  } else if (pathChunks[0] === 'shared') {
    if (pathChunks[1] === 'elements') {
      pathChunks.splice(3, 0, 'locales');
    } else {
      pathChunks.splice(1, 0, 'locales');
    }
  }

  return path.join(this.path, path.join.apply(null, pathChunks));
};

/* Helper functions */

function collectResourceIds(sourcePath, sourceLocale) {
  var appsPath = path.join(sourcePath, 'apps');
 
  var apps = utils.getDirectories(appsPath);

  var paths = [];

  apps.forEach(function(app) {
    var appPath = getAppLocaleFiles(
      sourcePath,
      sourceLocale,
      path.join('apps', path.basename(app)));

    paths = paths.concat(appPath);
  });

  var sharedPaths = getAppLocaleFiles(
    sourcePath, sourceLocale, path.join('shared'));
  paths = paths.concat(sharedPaths);

  var elementsPath = path.join(sourcePath, 'shared', 'elements');
  var elements = utils.getDirectories(elementsPath);
  elements.forEach(function(element) {
    var elementPath = getAppLocaleFiles(
      sourcePath,
      sourceLocale,
      path.join('shared', 'elements', path.basename(element)));

    paths = paths.concat(elementPath);
  });

  var ids = paths.map(function(p) {
    return p
      .replace('.' + sourceLocale + '.', '.{locale}.')
      .replace('/locales/', '/');
  });
  return ids;
}

function getAppLocaleFiles(sourcePath, sourceLocale, appPath) {
  var fullAppPath = path.join(sourcePath, appPath);
  
  var paths = [];
  var resourceFormats = Object.keys(GaiaApp.resourceFormats).join('|');
  var fileFilter =
    new RegExp('.' + sourceLocale + '.(' + resourceFormats + ')$');

  if (utils.fileExists(path.join(fullAppPath, 'locales'))) {
    paths = utils.ls(path.join(fullAppPath, 'locales'), true, fileFilter);
  }

  var dirs = utils.getDirectories(fullAppPath);

  dirs.forEach(function(dir) {
    if (utils.fileExists(path.join(dir, 'locales'))) {
      paths = paths.concat(
        utils.ls(path.join(dir, 'locales'), true, fileFilter));
    }
  });

  return paths.map(function(p) {
    return path.relative(sourcePath, p);
  });
}

exports.App = GaiaApp;
