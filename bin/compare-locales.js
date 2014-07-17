#!/usr/bin/env node

'use strict';

var program = require('commander');

var GaiaApp = require('../lib/mozilla/apps/gaia.js').GaiaApp;
var L10nCluster = require('../lib/mozilla/l10ncluster.js').L10nCluster;
var compareApp = require('../lib/mozilla/compare-locales.js').compareApp;

var l10nBase = '~/projects/gaia-l10n';
var locales = ['pl'];
var path = '/Users/zbraniecki/projects/gaia/apps/settings';

function compareLocales() {
  var app = new GaiaApp(path);

  var l10nCluster = new L10nCluster();

  compareApp(app, l10nCluster, locales);
}

program
  .version('0.0.1')
  .usage('[options] [file]')
  .parse(process.argv);

compareLocales();
