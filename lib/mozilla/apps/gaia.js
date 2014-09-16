'use strict';

var fs = require('fs');
var path = require('path');

var Promise = require('promise');

var utils = require('../utils.js');

var Langpack = require('../langpack.js').Langpack;
var Resource = require('../langpack.js').Resource;

var DOMAIN_NAME = 'gaiamobile.org';

function GaiaApp(appPath) {
  this.path = appPath;
  this.id = path.basename(appPath) + '.' + DOMAIN_NAME; 
  this.langpacks = {};

  this.manifest = JSON.parse(fs.readFileSync(this.path + '/manifest.webapp')); 
  this.defaultLocale = this.manifest.default_locale;
  this.locales = Object.keys(this.manifest.locales);
}

GaiaApp.prototype.getLangpacks = function() {
  return new Promise(function (resolve, reject) {
    getResourcesFromHTMLFiles(this.path).then(function(resources) {
      this.locales.forEach(function(localeCode) {
        var lp = new Langpack(this.id, localeCode, this.path);
        resources.forEach(function(resource) {
          var resID = resource[0];
          var resPath = resID.replace('{locale}', localeCode) 
          var resource = new Resource(resID,
                                      path.join(this.path, resPath));
          lp.resources[resID] = resource;
        }.bind(this));
        this.langpacks[localeCode] = lp;
      }.bind(this));
      resolve();
    }.bind(this));
  }.bind(this)); 
}

/* Helper functions */

function getResourcesFromHTMLFiles(appPath) {
  return new Promise(function (resolve, reject) {
    var results = [];

    var htmlPaths = utils.ls(appPath, true, /\.html$/);
    var it = 0;

    htmlPaths.forEach(function(htmlPath, i) {
      var htmlContent = utils.getFileContent(htmlPath);
      utils.getDocument(htmlContent).then(function(doc) {
        var links = doc.head.querySelectorAll('link[rel="localization"]');
        for (var i = 0; i < links.length; i++) {
          var link = links[i];
          results.push([link.getAttribute('href'), htmlPath]);
        }
        if (++it == htmlPaths.length) {
          resolve(results);
        }
      });
    });
  });
}

exports.GaiaApp = GaiaApp;
