'use strict';

var path = require('path');
var Promise = require('promise');

var GaiaApp = require('./apps/gaia.js').GaiaApp;
var compareLangpacks =
  require('./diff/compare.js').compareLangpacks;
var getLangpackFromDir = require('./langpack.js').getLangpackFromDir;

exports.compareDirs = function(path1, path2) {
  var lp1 = getLangpackFromDir(path1);
  var lp2 = getLangpackFromDir(path2);

  return compareLangpacks(lp1, lp2);
};

exports.compareL10nTreeDirs = function(treePath, locale1, locale2) {
  if (!locale1) {
    locale1 = 'en-US';
  }

  var path1 = path.join(treePath, locale1);
  var path2 = path.join(treePath, locale2);
  var lp1 = getLangpackFromDir(path1, locale1);
  var lp2 = getLangpackFromDir(path2, locale2);

  return compareLangpacks(lp1, lp2);
};

exports.compareL10nDirToSource =
  function(appPath, sourceLocale, treePath, locale) {

  var app = new GaiaApp(appPath);
  var manifest = sourceLocale ?
    Promise.resolve({ defaultLocale: sourceLocale }) :
    app.getManifest();

  var getLangpacks = function(manifest) {
    return [
      app.getLangpackFromSource(manifest.defaultLocale),
      app.getLangpackFromPath(treePath, locale)
    ];
  };

  return manifest.then(getLangpacks).then(
    Function.prototype.apply.bind(compareLangpacks, null));
};

exports.compareLangpacksInSource = function(appPath, sourceLocale, lang) {
  var app = new GaiaApp(appPath);
  var manifest = sourceLocale ?
    Promise.resolve({ defaultLocale: sourceLocale }) :
    app.getManifest();

  var getLangpacks = function(manifest) {
    return [
      app.getLangpackFromSource(manifest.defaultLocale),
      app.getLangpackFromSource(lang)
    ];
  };

  return manifest.then(getLangpacks).then(
    Function.prototype.apply.bind(compareLangpacks, null));
};
