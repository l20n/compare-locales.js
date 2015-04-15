'use strict';

var path = require('path');

var Comparer = require('./diff/compare').Comparer;
var appUtils = require('./apps/utils');

exports.compareDirs = function(config, path1, path2) {
  var App = appUtils.getApp(config.type);
  var comparer = new Comparer(config, App);

  var lp1 = App.getLangpackFromDir(path1);
  var lp2 = App.getLangpackFromDir(path2);

  return comparer.compareLangpacks(lp1, lp2);
};

exports.compareL10nDirToSource =
  function(config, sourcePath, treePath, locale) {

  var App = appUtils.getApp(config.type);

  var app = new App(sourcePath);
  var langpackPath = path.join(treePath, locale);

  var getLangpacks = [
    app.getLangpackFromSource(),
    app.getLangpackFromDir(langpackPath, locale)
  ];

  var comparer = new Comparer(config, app.constructor);
  return Promise.all(getLangpacks).then(
    Function.prototype.apply.bind(comparer.compareLangpacks, comparer));
};
