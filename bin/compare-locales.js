#!/usr/bin/env node

'use strict';

var program = require('commander');

var GaiaApp = require('../lib/mozilla/apps/gaia.js').GaiaApp;
var compareLangpacks =
  require('../lib/mozilla/compare-locales.js').compareLangpacks;
var serializeLangpackDiffToText =
  require('../lib/mozilla/diff.js').serializeLangpackDiffToText;


var l10nBase = '~/projects/gaia-l10n';
var locales = ['pl'];

var path1 = '/Users/zbraniecki/projects/gaia/apps/wappush';

function compareLocales() {
  var app = new GaiaApp(path1);
  app.getLangpacks().then(function() {
    var lp1 = app.langpacks['en-US'];
    var lp2 = app.langpacks['fr'];
    compareLangpacks(lp1, lp2).then(function(lpDiff) {
      var txt = serializeLangpackDiffToText(lpDiff);
      console.log(txt);
    });
  });

}


program
  .version('0.0.1')
  .usage('[options] [file]')
  .parse(process.argv);

compareLocales();
