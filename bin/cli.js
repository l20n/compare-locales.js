#!/usr/bin/env node

'use strict';

var program = require('commander');

var serializeLangpackDiffToText =
  require('../lib/mozilla/diff/serializer/text.js').serializeLangpackDiff;

var cl = require('../lib/mozilla/compare-locales.js');

function logError(e) {
  console.log(e.stack);
}

function compareLangpacksInSource(appPath, sourceLocale, locale) {
  cl.compareLangpacksInSource(appPath, sourceLocale, locale).then(
    serializeLangpackDiffToText).then(
      console.log, logError);
}

function compareL10nDirToSource(appPath, sourceLocale, langPath, lang) {
  cl.compareL10nDirToSource(appPath, sourceLocale, langPath, lang).then(
    serializeLangpackDiffToText).then(
      console.log, logError);
}

function compareL10nTreeDirs(l10nPath, sourceLocale, locale) {
  cl.compareL10nTreeDirs(l10nPath, sourceLocale, locale).then(
    serializeLangpackDiffToText).then(
      console.log, logError);
}

function compareDirs(path1, path2, output) {
  var serializerPath = '../lib/mozilla/diff/serializer/'+output+'.js';
  var serializeLangpackDiff =
    require(serializerPath).serializeLangpackDiff;
  cl.compareDirs(path1, path2).then(
    serializeLangpackDiff).then(
      console.log, logError);
}

program
  .version('0.0.1')
  .usage('[options] locale[, locale]')
  .option('-g, --gaia <dir>', 'Gaia dir')
  .option('-a, --app <dir>', 'App dir')
  .option('-l, --gaia-l10n <dir>', 'Gaia l10n dir')
  .option('-o, --output <json|text>', 'Output type (default: text)')
  .option('-s, --source-locale <locale>', 'Source locale')
  .parse(process.argv);

var appPath = program.app;
var l10nPath = program.gaiaL10n;
var sourceLocale = program.sourceLocale;
var locales = program.args;
var output = program.output || 'text';

if (appPath) {
  if (l10nPath) {
    compareL10nDirToSource(appPath, sourceLocale, l10nPath, locales[0]);
  } else {
    compareLangpacksInSource(appPath, sourceLocale, locales[0]);
  }
} else if (l10nPath) {
  compareL10nTreeDirs(l10nPath, sourceLocale, locales[0]);
} else {
  compareDirs(locales[0], locales[1], output);
}
