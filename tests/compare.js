'use strict';

/* global suite, suiteSetup, test */

var fs = require('fs');
var path = require('path');
var assert = require('assert');

var GaiaApp = require('../lib/mozilla/apps/gaia.js').GaiaApp;
var compareLangpacks =
  require('../lib/mozilla/diff/compare.js').compareLangpacks;
var serializeLangpackDiffToText =
  require('../lib/mozilla/diff/serialize.js').serializeLangpackDiffToText;

suite('Compare langpacks 2 args', function() {
  var lp1, lp2;

  suiteSetup(function(done) {
    var lang = 'fr';
    var app = new GaiaApp(path.join(__dirname, 'fixtures', 'apps', 'clock'));

    app.collectResources().then(function() {
      app.getLangpacks().then(function() {
        lp1 = app.langpacks[app.defaultLocale];
        lp2 = app.langpacks[lang];
        done();
      });
    });

  });

  test('compares two langpacks', function(done) {
    var outputPath = path.join(__dirname, 'fixtures', 'output.txt');

    compareLangpacks(lp1, lp2).then(
      serializeLangpackDiffToText).then(function(txt) {
        fs.readFile(outputPath, {encoding: 'utf8'}, function(err, data) {
          if (err) {
            throw err;
          }

          assert.equal(txt, data.slice(0, -1));
          done();
        });
    });

  });

});
