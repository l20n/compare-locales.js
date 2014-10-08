#!/usr/bin/env node

'use strict';

var program = require('commander');

var GaiaApp = require('../lib/mozilla/apps/gaia.js').GaiaApp;
var compareLangpacks =
  require('../lib/mozilla/diff/compare.js').compareLangpacks;
var serializeLangpackDiffToText =
  require('../lib/mozilla/diff/serialize.js').serializeLangpackDiffToText;

var path1 = '/Users/zbraniecki/projects/gaia/apps/wappush';

function compareLocales() {
  var app = new GaiaApp(path1);
  app.getLangpacks().then(function() {
    var lp1 = app.langpacks['en-US'];
    var lp2 = app.langpacks['fr'];
    var lpDiff = compareLangpacks(lp1, lp2);
    var txt = serializeLangpackDiffToText(lpDiff);
    console.log(txt);
  });

}


program
  .version('0.0.1')
  .usage('[options] [file]')
  .parse(process.argv);

compareLocales();
