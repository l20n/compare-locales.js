'use strict';

var path = require('path');
var utils = require('../../utils');
var Langpack = require('../../langpack').Langpack;

function GaiaApp(path) {
  this.path = path;
  this.sourceLocale = 'en-US';
  this._modules = null;
}

GaiaApp.resourceFormats = {
  'l20n': 'l20n',
  'properties': 'gaia_properties_compat'
};

GaiaApp.getHook = function(name) {
  if (!GaiaApp.hooks[name][1]) {
    GaiaApp.hooks[name][1] = require('./' + name);
  }
  return GaiaApp.hooks[name];
}

GaiaApp.hooks = {
  'placeables': ['compare-entries', undefined],
  'malformed':  ['compare-entries', undefined],
  'spellcheck': ['compare-entries', undefined],
  'escapes': ['compare-entries', undefined],
};

GaiaApp.getLangpackFromDir = function(path, locale) {
  var lp = new Langpack(this.prototype.constructor, locale, path);
  lp.collectResources();
  return lp;
}

GaiaApp.getFilePattern = function() {
  return '(' + Object.keys(GaiaApp.resourceFormats).join('|') + ')';
}

GaiaApp.prototype.getLangpackFromDir = function(dirPath, locale) {
  return this.getModules().then(function(modules) {
    var lp = new Langpack(GaiaApp, locale, dirPath);
    lp.resources = this.getResourcesFromDir(dirPath);
    return lp;
  }.bind(this));
}

GaiaApp.prototype.getLangpackFromSource = function() {
  return this.getModules().then(function(modules) {
    var lp = new Langpack(GaiaApp, this.sourceLocale, this.path);
    lp.resources = this.getResources();
    return lp;
  }.bind(this));
};

GaiaApp.prototype.getResourcesFromSource = function() {
  var reFormR = GaiaApp.getFilePattern();
  return this._modules.then(function(modules) {
    var resList = {};

    modules.forEach(function(modulePath) {
      var locPath = path.join(this.path, modulePath, 'locales');
      if (!utils.fileExists(locPath)) {
        return;
      }
      var resIds = utils.ls(locPath, true, new RegExp('\.' + this.sourceLocale + '\.' + reFormR + '$')).map(function(p) {
        var p2 = p.replace('.' + this.sourceLocale + '.', '.');
        return {id: modulePath + ':' + path.relative(locPath, p2),
                path: path.join(this.path, modulePath, 'locales', path.relative(locPath, p))};
      }.bind(this));

      resIds.forEach(function(resId) {
        resList[resId.id] = resId;
      });
    }, this);
    return resList;
  }.bind(this));
};

GaiaApp.prototype.getResourcesFromDir = function(dirPath) {
  // deduplicating
  var resPaths = new Set();

  var reFormR = '(' + Object.keys(GaiaApp.resourceFormats).join('|') + ')';

  return this._modules.then(function(modules) {
    var resList = {};

    modules.forEach(function(modulePath) {
      var locPath = path.join(dirPath, modulePath);
      
      if (!utils.fileExists(locPath)) {
        return;
      }
      var resIds = utils.ls(locPath, true, new RegExp(reFormR + '$')).map(function(p) {
        var absPath = path.join(dirPath, modulePath, path.relative(locPath, p));
        return {id: modulePath + ':' + path.relative(locPath, p),
                path: absPath};
      }.bind(this));
      resIds.forEach(function(resId) {
        if (resPaths.has(resId.path)) {
          return;
        }
        resPaths.add(resId.path);
        resList[resId.id] = resId;
      });
    }, this);
    return resList;
  }.bind(this));
};

GaiaApp.prototype.getResources = function() {
  return this._resources || (this._resources =
    this.getResourcesFromSource());
};

GaiaApp.prototype.buildResourcePath = function(relPath) {
  return relPath;
};

GaiaApp.prototype.getModules = function() {
  return this._modules || (this._modules = 
    collectModules(this.path));
}

/* Helper functions */

function collectModules(gaiaPath) {
  return collectAppModules(gaiaPath).then(function(appModules) {
    var elementsPath = path.join(gaiaPath, 'shared', 'elements');
    return collectElementModules(elementsPath).then(function(elModules) {
      var modules = appModules;
      elModules.forEach(function(elModule) {
        modules.push(path.join('shared', 'elements', elModule));
      });
      modules.push('shared');
      return modules;
    });
  });
}

function collectElementModules(basePath) {
  return new Promise(function(resolve, reject) {
    var dirs = utils.getDirectories(basePath);

    var modules = [];
    dirs.forEach(function(dir) {
      if (utils.fileExists(path.join(dir, 'locales'))) {
        modules.push(path.relative(basePath, dir));
      }
    });

    resolve(modules);
  });
}

function collectAppModules(gaiaPath) {
  var modulesPath = path.join(gaiaPath, 'apps');
  return new Promise(function(resolve, reject) {
    var modules = [];

    var dirs = utils.getDirectories(modulesPath);

    var manifests = [];
    dirs.forEach(function(dir) {
      if (utils.fileExists(path.join(dir, 'manifest.webapp'))) {
        manifests.push(
          utils.getFileContent(path.join(dir, 'manifest.webapp')).then(function(source) {
            return [dir, source];
          }));
      }
    });

    Promise.all(manifests).then(function(manifests) {
      manifests.forEach(function(manTuple) {
        var man = JSON.parse(manTuple[1]);
        if (man.entry_points) {
          Object.keys(man.entry_points).forEach(function(e) {
            modules.push(path.join('apps', path.relative(modulesPath, path.join(manTuple[0], e))));
          });
        } else {
          modules.push(path.join('apps', path.relative(modulesPath, manTuple[0])));
        }
      });
      resolve(modules);
    });
  });
}

exports.App = GaiaApp;
