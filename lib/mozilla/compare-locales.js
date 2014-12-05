'use strict';

var path = require('path');
var Promise = require('promise');

var Comparer = require('./diff/compare').Comparer;
var getLangpackFromDir = require('./langpack').getLangpackFromDir;
var appUtils = require('./apps/utils');

exports.compareDirs = function(config, path1, path2) {
  var App = appUtils.getApp(config.type);
  var comparer = new Comparer(config, App.prototype);

  var lp1 = getLangpackFromDir(path1);
  var lp2 = getLangpackFromDir(path2);

  return comparer.compareLangpacks(lp1, lp2, config.type);
};

exports.compareL10nDirToSource =
  function(config, sourcePath, treePath, locale) {

  var App = appUtils.getApp(config.type);

  var app = new App(sourcePath);
  var langpackPath = path.join(treePath, locale);

  var getLangpacks = [
    app.getLangpackFromSource(),
    getLangpackFromDir(langpackPath, locale)
  ];

  var comparer = new Comparer(config, app);
  return Promise.all(getLangpacks).then(
    Function.prototype.apply.bind(comparer.compareLangpacks, comparer));
};
