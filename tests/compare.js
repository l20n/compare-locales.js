'use strict';

/* global suite, test */

var fs = require('fs');
var path = require('path');
var assert = require('assert');

var cl = require('../lib/mozilla/compare-locales.js');
var serializeLangpackDiffToText =
  require('../lib/mozilla/diff/serializer/text.js').serializeLangpackDiff;

function getOutputPath(name) {
  return path.join(__dirname, 'fixtures', 'output', name + '.txt');
}

function checkOutput(done, fixtureName, output) {
  fs.readFile(getOutputPath(fixtureName), {encoding: 'utf8'},
    function(err, data) {
      if (err) {
        throw err;
      }

      assert.equal(output, data.slice(0, -1));
      done();
    });
}

function logError(e) {
  console.error(e.stack);
}

suite('Comparison modes', function() {
  var appPath = path.join(__dirname, 'fixtures', 'apps', 'clock');
  var l10nPath = path.join(__dirname, 'fixtures', 'locales');
  var enUSPath = path.join(__dirname, 'fixtures', 'locales', 'en-US');
  var frPath = path.join(__dirname, 'fixtures', 'locales', 'fr');

  test('compare langpacks in source', function(done) {
    cl.compareLangpacksInSource(appPath, null, 'fr').then(
      serializeLangpackDiffToText).then(
        checkOutput.bind(null, done, 'compareLangpacksInSource'))
          .catch(logError);
  });

  test('compare l10n dir to source', function(done) {
    cl.compareL10nDirToSource(appPath, null, l10nPath, 'fr').then(
      serializeLangpackDiffToText).then(
        checkOutput.bind(null, done, 'compareL10nDirToSource'))
          .catch(logError);
  });

  test('compare l10n tree dirs', function(done) {
    cl.compareL10nTreeDirs(l10nPath, null, 'fr').then(
      serializeLangpackDiffToText).then(
        checkOutput.bind(null, done, 'compareL10nTreeDirs'))
          .catch(logError);
  });

  test('compare dirs', function(done) {
    cl.compareDirs(enUSPath, frPath).then(
      serializeLangpackDiffToText).then(
        checkOutput.bind(null, done, 'compareDirs'))
          .catch(logError);
  });

});
