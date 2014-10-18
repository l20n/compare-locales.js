#!/usr/bin/env node

'use strict';

var program = require('commander');

var GaiaApp = require('../lib/mozilla/apps/gaia.js').GaiaApp;
var compareLangpacks =
  require('../lib/mozilla/diff/compare.js').compareLangpacks;
var serializeLangpackDiffToText =
  require('../lib/mozilla/diff/serialize.js').serializeLangpackDiffToText;

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

program
  .version('0.0.1')
  .usage('[options] webapp locale')
  .parse(process.argv);

if (program.args.length === 3) {
  compareLocales2(program.args[0], program.args[1], program.args[2]);
} else {
  compareLocales(program.args[0], program.args[1]);
}
