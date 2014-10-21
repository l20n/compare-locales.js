#!/usr/bin/env node

'use strict';

var program = require('commander');
var path = require('path');

var GaiaApp = require('../lib/mozilla/apps/gaia.js').GaiaApp;
var compareLangpacks =
  require('../lib/mozilla/diff/compare.js').compareLangpacks;
var serializeLangpackDiffToText =
  require('../lib/mozilla/diff/serialize.js').serializeLangpackDiffToText;


var getLangpackFromDir = require('../lib/mozilla/langpack.js').getLangpackFromDir;

function compareLocales(appPath, lang) {
  var app = new GaiaApp(appPath);

  app.collectResources().then(function() {
    app.getLangpacks().then(function() {
      var lp1 = app.langpacks[app.defaultLocale];
      var lp2 = app.langpacks[lang];
      compareLangpacks(lp1, lp2).then(
        serializeLangpackDiffToText).then(
          console.log);
    });
  });
}

function compareLocales2(appPath, langPath, lang) {
  var app = new GaiaApp(appPath);

  app.collectResources().then(function() {

    var lp = app.getLangpackFromPath(langPath, lang);

    app.getLangpacks().then(function() {
      var lp1 = app.langpacks[app.defaultLocale];
      compareLangpacks(lp1, lp).then(
        serializeLangpackDiffToText).then(
          console.log);
    });
  });
}

function compareLocales3(l10nPath, sourceLocale, locale) {
  var path1 = path.join(l10nPath, sourceLocale);
  var path2 = path.join(l10nPath, locale);
  var lp1 = getLangpackFromDir(path1);
  var lp2 = getLangpackFromDir(path2);

  compareLangpacks(lp1, lp2).then(
    serializeLangpackDiffToText).then(
      console.log);
}

function compareLocales4(path1, path2) {
  var lp1 = getLangpackFromDir(path1);
  var lp2 = getLangpackFromDir(path2);

  compareLangpacks(lp1, lp2).then(
    serializeLangpackDiffToText).then(
      console.log);
}

program
  .version('0.0.1')
  .usage('[options] locale, [locale]')
  .option('-g, --gaia <dir>', 'Gaia dir')
  .option('-a, --app <dir>', 'App dir')
  .option('-l, --gaia-l10n <dir>', 'Gaia l10n dir')
  .option('-s, --source-locale <locale>', 'Source locale')
  .parse(process.argv);

var gaiaPath = program.gaia;
var appPath = program.app;
var l10nPath = program.gaiaL10n;
var sourceLocale = program.sourceLocale || 'en-US';
var locales = program.args;

if (appPath) {
  if (l10nPath) {
    compareLocales2(appPath, l10nPath, locales[0]);
  } else {
    compareLocales(appPath, locales[0]);
  }
} else if (l10nPath) {
  compareLocales3(l10nPath, sourceLocale, locales[0]);
} else {
  compareLocales4(locales[0], locales[1]);
}
