#!/usr/bin/env node

'use strict';

var program = require('commander');

var serializeLangpackDiffToText =
  require('../lib/mozilla/diff/serializer/text').serializeLangpackDiff;
var levels = require('../lib/mozilla/diff/levels');

var cl = require('../lib/mozilla/compare-locales');

function logError(e) {
  console.log(e.stack);
}

function compareLangpacksInSource(appPath, sourceLocale, locale) {
  cl.compareLangpacksInSource(
    program, appPath, sourceLocale, locale).then(
      serializeLangpackDiffToText).then(
        console.log, logError);
}

function compareL10nDirToSource(appPath, sourceLocale, langPath, lang) {
  cl.compareL10nDirToSource(
    program, appPath, sourceLocale, langPath, lang).then(
      serializeLangpackDiffToText).then(
        console.log, logError);
}

function compareDirs(path1, path2, output) {
  var serializerPath = '../lib/mozilla/diff/serializer/'+output+'.js';
  var serializeLangpackDiff =
    require(serializerPath).serializeLangpackDiff;
  cl.compareDirs(
    program, path1, path2).then(
      serializeLangpackDiff).then(
        console.log, logError);
}

function checkMore(v, total) {
  return levels.getLower(total);
}

program
  .version('0.0.1')
  .usage('[options] locale[, locale]')
  .option('-g, --gaia <dir>', 'Gaia dir')
  .option('-a, --app <dir>', 'App dir')
  .option('-l, --gaia-l10n <dir>', 'Gaia l10n dir')
  .option('-o, --output <json|text>', 'Output type (default: text)', 'text')
  .option('-s, --source-locale <locale>', 'Source locale')
  .option('-c, --check-more', 'Check more', checkMore, levels.CRITICAL)
  .parse(process.argv);

var appPath = program.app;
var l10nPath = program.gaiaL10n;
var sourceLocale = program.sourceLocale;
var locales = program.args;
var output = program.output;

if (!appPath) {
  return compareDirs(locales[0], locales[1], output);
}

if (l10nPath) {
  compareL10nDirToSource(appPath, sourceLocale, l10nPath, locales[0]);
} else {
  compareLangpacksInSource(appPath, sourceLocale, locales[0]);
}
