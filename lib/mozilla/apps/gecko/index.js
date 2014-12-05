'use strict';

function GeckoApp(path) {
  this.path = path;
  this.sourceLocale = 'en-US';
  this.apps = {};
  this._langpacks = Object.create(null);
}

GeckoApp.resourceFormats = {
  'properties': 'gecko_properties'
};

GeckoApp.prototype.getLangpackFromSource = function() {
};

GeckoApp.prototype.getResources = function() {
};

GeckoApp.prototype.buildResourcePath = function() {
};


exports.App = GeckoApp;
