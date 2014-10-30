'use strict';

var path = require('path');

var Promise = require('promise');
var Set = require('es6-set');

var utils = require('../utils.js');

var Langpack = require('../langpack.js').Langpack;

var DOMAIN_NAME = 'gaiamobile.org';

function GaiaApp(appPath) {
  this.path = appPath;
  this.type = path.extname(this.path) === '.html' ? 'file' : 'dir';
  this.appPath = this.type === 'dir' ? this.path : path.dirname(this.path); 
  this.dirName = path.basename(this.appPath);

  this.id = this.dirName + '.' + DOMAIN_NAME; 

  this._langpacks = Object.create(null);
}

function parseManifest(manifest) {
  return {
    defaultLocale: manifest.default_locale,
    locales: Object.keys(manifest.locales)
  };
}

GaiaApp.prototype.getManifest = function() {
  return this._manifest ||
    (this._manifest = utils.loadJSON(
      path.join(this.appPath, 'manifest.webapp')).then(parseManifest));
};

GaiaApp.prototype.getResources = function() {
  return this._resources ||
    (this._resources = (this.type === 'file') ? 
      getResourcesFromHTMLFile(this.path) :
      getResourcesFromHTMLFiles(this.path));
};

GaiaApp.prototype.getLangpack = function(pathBuilder, loc, path) {
  if (this._langpacks[loc]) {
    return this._langpacks[loc];
  }

  var lp = new Langpack(this.id, loc, path);
  lp.addResources(pathBuilder, this.getResources());

  return this._langpacks[loc] = lp;
};
        
GaiaApp.prototype.getLangpackFromSource = function(loc) {
  var pathBuilder = buildResourcePath.bind(
    null, this.appPath, path.join(this.appPath, '..', '..'));
  return this.getLangpack(pathBuilder, loc, this.path);
};

GaiaApp.prototype.getLangpackFromPath = function(l10nRootPath, loc) {
  var localePath = path.join(l10nRootPath, loc);

  var pathBuilder = function(resPath) {
    var pathChunks = utils.splitPath(resPath);
    var newPath = [];
    if (pathChunks[0] === 'locales') {
      newPath.push('apps');
      newPath.push(this.dirName);
      newPath = newPath.concat(pathChunks.slice(1,-1));
      newPath.push(
        pathChunks[pathChunks.length-1].replace('.'+ loc +'.', '.'));
    } else if (pathChunks[0] === 'shared') {
      newPath.push('shared');
      newPath = newPath.concat(pathChunks.slice(2, -1));
      newPath.push(
        pathChunks[pathChunks.length-1].replace('.'+ loc +'.', '.'));
    }
    return path.join.apply(null, [localePath].concat(newPath));
  }.bind(this);

  return this.getLangpack(pathBuilder, loc, localePath);
};

/* Helper functions */

function buildResourcePath(appPath, sharedPath, relResPath) {
  var pathChunks = utils.splitPath(relResPath);

  var absResPath = (pathChunks[0] === 'shared') ?
    path.join(sharedPath, relResPath) :
    path.join(appPath, relResPath);

  if (utils.isSubjectToBranding(absResPath)) {
    absResPath = absResPath.replace('branding', 'branding/unofficial');
  }
  return absResPath;
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
