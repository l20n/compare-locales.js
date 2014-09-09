'use strict';

var fs = require('fs');
var utils = require('../utils.js');
var App = require('./app.js').App;

function GaiaApp(path) {
  this.path = path;
  this.langpacks = {};

  this.manifest = JSON.parse(fs.readFileSync(this.path + '/manifest.webapp')); 
  this.defaultLocale = this.manifest.default_locale;
  this.locales = Object.keys(this.manifest.locales);
}

GaiaApp.prototype.getLangpacks = function() {
  var resources = getResourcesFromHTMLFiles(this.path);
  
  this.locales.forEach(function(locale) {
  });
}

/* Helper functions */

function getResourcesFromHTMLFiles(path) {
  var files = utils.ls(path, true, /\.html$/);
  console.log(files);
}

exports.GaiaApp = GaiaApp;
