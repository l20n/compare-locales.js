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
  app.getLangpacks().then(function() {
    var lp1 = app.langpacks[app.defaultLocale];
    var lp2 = app.langpacks[lang];
    var lpDiff = compareLangpacks(lp1, lp2);
    var txt = serializeLangpackDiffToText(lpDiff);
    console.log(txt);
  });

}


program
  .version('0.0.1')
  .usage('[options] webapp locale')
  .parse(process.argv);

compareLocales(program.args[0], program.args[1]);
