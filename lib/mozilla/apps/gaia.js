'use strict';

var fs = require('fs');

var App = require('./app.js').App;

function GaiaApp(path) {
  this.path = path;

  this.manifest = JSON.parse(fs.readFileSync(this.path + '/manifest.webapp')); 
  this.defaultLocale = this.manifest.default_locale;
}

exports.GaiaApp = GaiaApp;
