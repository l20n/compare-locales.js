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

function compareL10nDirToSource(sourcePath, treePath, lang) {
  cl.compareL10nDirToSource(
    program, sourcePath, treePath, lang).then(
      serializeLangpackDiffToText).then(
        console.log, logError);
}

function compareDirs(path1, path2, output) {
  var serializerPath = '../lib/mozilla/diff/serializer/' + output + '.js';
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
  .option('-t, --type <gaia|gecko>', 'App type (default: gaia)', 'gaia')
  .option('-s, --source <dir>', 'App source repository')
  .option('-l, --l10n-tree <dir>', 'L10n Tree directory')
  .option('-o, --output <json|text|pike>', 'Output type (default: text)', 'text')
  .option('-c, --check-more', 'Check more (can be used more than once)',
          checkMore, levels.CRITICAL)
  .parse(process.argv);

var sourcePath = program.source;
var l10nTreePath = program.l10nTree;
var locales = program.args;
var output = program.output;

if (l10nTreePath) {
  compareL10nDirToSource(sourcePath, l10nTreePath, locales[0]);
} else {
  compareDirs(locales[0], locales[1], output);
}
