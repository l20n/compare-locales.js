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
  this.type = path.extname(this.path) === '.html' ? 'file' : 'dir';
  this.appPath = this.type === 'dir' ? this.path : path.dirname(this.path); 
  this.dirName = path.basename(this.appPath);

  this.id = this.dirName + '.' + DOMAIN_NAME; 
}

GaiaApp.prototype.init = function() {
  this.manifest = this.getManifest();
  this.resources = this.collectResources();
  this.langpacks = this.getLangpacks();
  return this;
};

function parseManifest(manifest) {
  return {
    defaultLocale: manifest.default_locale,
    locales: Object.keys(manifest.locales)
  };
}

GaiaApp.prototype.getManifest = function() {
  return this.manifest = utils.loadJSON(
    path.join(this.appPath, 'manifest.webapp')).then(parseManifest);
};

GaiaApp.prototype.collectResources = function() {
  return this.resources = (this.type === 'file') ? 
    getResourcesFromHTMLFile(this.path) :
    getResourcesFromHTMLFiles(this.path);
};

GaiaApp.prototype.getLangpacks = function(locales) {
  function isRequested(loc) {
    return locales.indexOf(loc) !== -1;
  }

  var pathBuilder = buildResourcePath.bind(
    null, this.appPath, path.join(this.appPath, '..', '..'));

  var createLangpack = function(loc) {
    var lp = new Langpack(this.id, loc, this.path);
    lp.addResources(pathBuilder, this.resources);
    return lp;
  }.bind(this);

  return this.langpacks = this.manifest.then(function(manifest) {
    var appLocales = locales ?
      manifest.locales.filter(isRequested) :
      manifest.locales;

    return Promise.all(
      appLocales.map(createLangpack)).then(utils.zip.bind(null, appLocales));
  });
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

function buildResourcePath(appPath, sharedPath, resID, resPath) {
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
