'use strict';

/* global suite, test */

var fs = require('fs');
var path = require('path');
var assert = require('assert');

var cl = require('../lib/mozilla/compare-locales.js');
var serializeLangpackDiffToText =
  require('../lib/mozilla/diff/serialize.js').serializeLangpackDiffToText;

function checkOutput(done, fixture, output) {
  fs.readFile(fixture, {encoding: 'utf8'}, function(err, data) {
    if (err) {
      throw err;
    }

    assert.equal(output, data.slice(0, -1));
    done();
  });
}

suite('Compare langpacks in source', function() {

  test('compares two langpacks', function(done) {
    var appPath = path.join(__dirname, 'fixtures', 'apps', 'clock');
    var outputPath = path.join(__dirname, 'fixtures', 'output.txt');

    cl.compareLangpacksInSource(appPath, null, 'fr').then(
      serializeLangpackDiffToText).then(
        checkOutput.bind(null, done, outputPath)).catch(console.error);
  });

});
