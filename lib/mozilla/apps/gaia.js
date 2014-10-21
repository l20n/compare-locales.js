'use strict';

var path = require('path');

var Promise = require('promise');
var Set = require('es6-set');

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
  var getRes;
  if (this.type === 'file') {
    getRes = getResourcesFromHTMLFile;
  } else {
    getRes = getResourcesFromHTMLFiles;
  }

  return getRes(this.path).then(function(resources) {
    return this.resources = resources;
  }.bind(this));
};

GaiaApp.prototype.getLangpacks = function(locales) {
  return new Promise(function (resolve) {
    this.locales.forEach(function(localeCode) {
      if (locales && locales.indexOf(localeCode) === -1) {
        return;
      }
      var lp = new Langpack(this.id, localeCode, this.path);
      this.resources.forEach(function(resource) {
        var resID = resource;
        var resPath = resID.replace('{locale}', localeCode);

        resPath = buildResourcePath(
          resID, resPath, this.appPath, path.join(this.appPath, '..', '..'));
        if (utils.fileExists(resPath)) {
          resource = new Resource(resID, resPath);
          lp.resources[resID] = resource;
        }
      }.bind(this));
      this.langpacks[localeCode] = lp;
    }.bind(this));
    resolve();
  }.bind(this)); 
};

GaiaApp.prototype.getLangpackFromPath = function(l10nRootPath, localeCode) {
  var localePath = path.join(l10nRootPath, localeCode);
  var lp = new Langpack(this.id, localeCode, localePath);
  this.resources.forEach(function(resID) {
    var resPath = resID.replace('{locale}', localeCode);
    var pathChunks = utils.splitPath(resPath);

    var newPath = [];
    if (pathChunks[0] === 'locales') {
      newPath.push('apps');
      newPath.push(this.dirName);
      newPath = newPath.concat(pathChunks.slice(1,-1));
      newPath.push(
        pathChunks[pathChunks.length-1].replace('.'+localeCode+'.', '.'));
    } else if (pathChunks[0] === 'shared') {
      newPath.push('shared');
      newPath = newPath.concat(pathChunks.slice(2, -1));
      newPath.push(
        pathChunks[pathChunks.length-1].replace('.'+localeCode+'.', '.'));
    }

    var newResPath = path.join(localePath, utils.joinPath(newPath));

    if (utils.fileExists(newResPath)) {
      var resource = new Resource(resID, newResPath);
      lp.resources[resID] = resource;
    }
  }.bind(this));
  return lp;
};

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

function isNotTestFile(path) {
  return path.indexOf('/test/') === -1;
}

function traverseCollection(fn, col) {
  return !col.forEach ?
    fn(col) : col.forEach(traverseCollection.bind(null, fn));
}

function flattenResources(resLists) {
  var flatResources = new Set();
  traverseCollection(function(res) {
    flatResources.add(res);
  }, resLists);
  return flatResources;
}

function getResourcesFromHTMLFiles(appPath) {
    var htmlPaths = utils.ls(appPath, true, /\.html$/).filter(isNotTestFile);
    return Promise.all(
      htmlPaths.map(getResourcesFromHTMLFile)).then(flattenResources);
}

function getResourcesFromHTMLFile(htmlPath) {
  return utils.getFileContent(htmlPath)
    .then(utils.getDocument)
    .then(function(doc) {
      return Array.prototype.map.call(
        doc.head.querySelectorAll('link[rel="localization"]'),
        function(link) {
          return link.getAttribute('href');
        });
    });
}

exports.GaiaApp = GaiaApp;
