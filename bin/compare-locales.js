#!/usr/bin/env node

'use strict';

var program = require('commander');

var GaiaApp = require('../lib/mozilla/apps/gaia.js').GaiaApp;
var Directory = require('../lib/mozilla/langpack.js').Directory;
var compareDirs = require('../lib/mozilla/compare-locales.js').compareDirectories;

var l10nBase = '~/projects/gaia-l10n';
var locales = ['pl'];

var path1 = '/Users/zbraniecki/projects/gaia-l10n/v1_3/en-US/apps/settings';
var path2 = '/Users/zbraniecki/projects/gaia-l10n/v1_3/pl/apps/settings';

function compareLocales() {
  var dir1 = new Directory(path1);

  var dir2 = new Directory(path2);

  compareDirs(dir1, dir2);
}


program
  .version('0.0.1')
  .usage('[options] [file]')
  .parse(process.argv);

compareLocales();
