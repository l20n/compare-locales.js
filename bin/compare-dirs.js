#!/usr/bin/env node

'use strict';

var program = require('commander');

var cl = require('../lib/mozilla/compare-locales');

function logError(e) {
  console.log(e.stack);
}

function compareDirs(path1, path2, output) {
  var serializerPath = '../lib/mozilla/diff/serializer/' + output + '.js';
  var serializeLangpackDiff = require(serializerPath).serializeLangpackDiff;
  cl.compareDirs(
    program,
    path1,
    path2
  )
  .then(serializeLangpackDiff).then(console.log, logError);
}

program
  .version('0.0.1')
  .usage('[options] reference locale')
  .option('-t, --type <gaia|gecko>', 'App type (default: gaia)', 'gaia')
  .option('--data <text|json|exhibit>', 'Output type (default: text)',
    'text')
  .option('-r, --run-tests <tests>', 'Run tests', '')
  .parse(process.argv);

var dirs = program.args;
var output = program.data;

if (dirs.length < 2) {
  console.log('Usage: compare-dirs [options] reference locale\n');
  console.error('compare-dirs: error: Reference and localization required');
} else {
  compareDirs(dirs[0], dirs[1], output);
}
