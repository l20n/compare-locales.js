'use strict';

var Promise = require('promise');
var EventEmitter = require('events').EventEmitter;

var GaiaApp = require('./apps/gaia').GaiaApp;
var Comparer = require('./diff/compare').Comparer;
var getLangpackFromDir = require('./langpack').getLangpackFromDir;

var emitter = new EventEmitter();

emitter.on('compare-entries', require('../mozilla/apps/gaia/placeables'));
emitter.on('compare-entries', require('../mozilla/apps/gaia/spellcheck'));

exports.compareDirs = function(config, path1, path2) {
  var lp1 = getLangpackFromDir(path1);
  var lp2 = getLangpackFromDir(path2);

  var comparer = new Comparer(config, emitter);
  return comparer.compareLangpacks(lp1, lp2);
};

exports.compareL10nDirToSource =
  function(config, appPath, sourceLocale, treePath, locale) {

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

  var comparer = new Comparer(config, emitter);
  return manifest.then(getLangpacks).then(
    Function.prototype.apply.bind(comparer.compareLangpacks, comparer));
};

exports.compareLangpacksInSource =
  function(config, appPath, sourceLocale, lang) {

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

  var comparer = new Comparer(config, emitter);
  return manifest.then(getLangpacks).then(
    Function.prototype.apply.bind(comparer.compareLangpacks, comparer));
};
