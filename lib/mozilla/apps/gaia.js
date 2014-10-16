'use strict';

var path = require('path');

var Promise = require('promise');

var utils = require('../utils.js');

var Langpack = require('../langpack.js').Langpack;
var Resource = require('../langpack.js').Resource;

var DOMAIN_NAME = 'gaiamobile.org';

function GaiaApp(appPath) {
  this.path = appPath;
  this.type = this.path.substr(-5) !== '.html' ? 'dir' : 'file';
  this.appPath = this.type === 'dir' ? this.path : path.dirname(this.path); 
  this.dirName = path.basename(this.appPath);

  this.id = this.dirName + '.' + DOMAIN_NAME; 
  this.langpacks = {};
  this.manifest = utils.loadJSON(this.appPath + '/manifest.webapp'); 
  this.defaultLocale = this.manifest.default_locale;
  this.locales = Object.keys(this.manifest.locales);

  this.resources = [];
}

GaiaApp.prototype.collectResources = function() {
  return new Promise(function (resolve, reject) {
    var getRes;
    if (this.type === 'file') {
      getRes = getResourcesFromHTMLFile;
    } else {
      getRes = getResourcesFromHTMLFiles;
    }

    getRes(this.path).then(function(resources) {
      this.resources = resources;
      resolve();
    }.bind(this));
  }.bind(this));
}

GaiaApp.prototype.getLangpacks = function() {
  return new Promise(function (resolve, reject) {
    this.locales.forEach(function(localeCode) {
      var lp = new Langpack(this.id, localeCode, this.path);
      this.resources.forEach(function(resource) {
        var resID = resource;
        var resPath = resID.replace('{locale}', localeCode);

        resPath = buildResourcePath(
          resID, resPath, this.appPath, path.join(this.appPath, '..', '..'));
        if (utils.fileExists(resPath)) {
          var resource = new Resource(resID, resPath);
          lp.resources[resID] = resource;
        }
      }.bind(this));
      this.langpacks[localeCode] = lp;
    }.bind(this));
    resolve();
  }.bind(this)); 
}

GaiaApp.prototype.getLangpackFromPath = function(rootPath) {
  var localeCode = 'fr';

  var lp = new Langpack(this.id, localeCode, rootPath);
  this.resources.forEach(function(resID) {
    var resPath = resID.replace('{locale}', localeCode);
    var pathChunks = utils.splitPath(resPath);

    var newPath = [];
    if (pathChunks[0] === 'locales') {
      newPath.push('apps');
      newPath.push(this.dirName);
      newPath = newPath.concat(pathChunks.slice(1,-1));
      newPath.push(pathChunks[pathChunks.length-1].replace('.'+localeCode+'.', '.'));
    } else if (pathChunks[0] === 'shared') {
      newPath.push('shared');
      newPath = newPath.concat(pathChunks.slice(2, -1));
      newPath.push(pathChunks[pathChunks.length-1].replace('.'+localeCode+'.', '.'));
    }

    var newResPath = path.join(rootPath, utils.joinPath(newPath));

    if (utils.fileExists(newResPath)) {
      var resource = new Resource(resID, newResPath);
      lp.resources[resID] = resource;
    }
  }.bind(this));
  return lp;
}

/* Helper functions */

function buildResourcePath(resID, resPath, appPath, sharedPath) {
  var pathChunks = utils.splitPath(resPath);

  if (pathChunks[0] === 'shared') {
    resPath = path.join(sharedPath, resPath);
  } else {
    resPath = path.join(appPath, resPath);
  }

  if (utils.isSubjectToBranding(resPath)) {
    resPath = resPath.replace('branding', 'branding/unofficial');
  }
  return resPath;
}

function getResourcesFromHTMLFiles(appPath) {
  return new Promise(function (resolve, reject) {
    var results = [];

    var htmlPaths = utils.ls(appPath, true, /\.html$/);

    var it = 0;

    htmlPaths.forEach(function(htmlPath, i) {
      if (htmlPath.indexOf('/test/') !== -1) {
        if (++it == htmlPaths.length) {
          resolve(results);
        }
        return;
      }
      getResourcesFromHTMLFile(htmlPath).then(function(res) {
        res.forEach(function(r) {
          if (results.indexOf(r) === -1) {
            results.push(r);
          }
        });
        if (++it == htmlPaths.length) {
          resolve(results);
        }
      });
    });
  });
}

function getResourcesFromHTMLFile(htmlPath) {
  return new Promise(function (resolve, reject) {
    var htmlContent = utils.getFileContent(htmlPath);
    utils.getDocument(htmlContent).then(function(doc) {
      var results = [];
      var links = doc.head.querySelectorAll('link[rel="localization"]');
      for (var i = 0; i < links.length; i++) {
        var link = links[i];
        results.push(link.getAttribute('href'));
      }
      resolve(results);
    });
  });
}

exports.GaiaApp = GaiaApp;
