'use strict';

/* global suite, test */

var fs = require('fs');
var path = require('path');
var assert = require('assert');

var cl = require('../lib/mozilla/compare-locales');
var levels = require('../lib/mozilla/diff/levels');
var serializeLangpackDiffToText =
  require('../lib/mozilla/diff/serializer/text').serializeLangpackDiff;

function getOutputPath(name) {
  return path.join(__dirname, 'fixtures', 'output', name + '.txt');
}

function checkOutput(done, fixtureName, output) {
  fs.readFile(getOutputPath(fixtureName), {encoding: 'utf8'},
    function(err, data) {
      if (err) {
        throw err;
      }

      // strip data from EOF
      assert.equal(output, data.slice(0, -1));
      done();
    });
}

function logError(e) {
  console.error(e.stack);
}

var sourcePath = path.join(__dirname, 'fixtures', 'gaia');
var l10nPath = path.join(__dirname, 'fixtures', 'locales');
var enUSPath = path.join(__dirname, 'fixtures', 'locales', 'en-US');
var frPath = path.join(__dirname, 'fixtures', 'locales', 'fr');

suite('Comparison modes', function() {
  var config = {
    type: 'gaia'
  };

  test('compare l10n dir to source', function(done) {
    cl.compareL10nDirToSource(config, sourcePath, l10nPath, 'fr').then(
      serializeLangpackDiffToText).then(
        checkOutput.bind(null, done, 'compareL10nDirToSource'))
          .catch(logError);
  });

  test('compare dirs', function(done) {
    cl.compareDirs(config, enUSPath, frPath).then(
      serializeLangpackDiffToText).then(
        checkOutput.bind(null, done, 'compareDirs'))
          .catch(logError);
  });

});

suite('Checks', function() {
  test('rogue placeables are reported as errors', function(done) {
    var config = {
      type: 'gaia',
      checkMore: levels.WARNING,
      runTests: 'placeables'
    };

    cl.compareDirs(config, enUSPath, frPath).then(
      serializeLangpackDiffToText).then(
        checkOutput.bind(null, done, 'checks'))
          .catch(logError);
  });

  test('rogue placeables are not reported if config accepts only criticals',
    function(done) {

    var config = {
      type: 'gaia',
      checkMore: levels.CRITICAL,
      runTests: 'placeables'
    };

    cl.compareDirs(config, enUSPath, frPath).then(
      serializeLangpackDiffToText).then(
        checkOutput.bind(null, done, 'compareDirs'))
          .catch(logError);
  });

});
