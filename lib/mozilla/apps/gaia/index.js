'use strict';

var path = require('path');
var Promise = require('promise');
var utils = require('../../utils');
var Langpack = require('../../langpack').Langpack;

function GaiaApp(path) {
  this.path = path;
  this.sourceLocale = 'en-US';
  this._modules = null;
}

GaiaApp.resourceFormats = {
  'l20n': 'l20n',
  'properties': 'gaia_properties'
};

GaiaApp.prototype.hooks = [
  ['compare-entries', require('./placeables')],
  ['compare-entries', require('./spellcheck')],
];

GaiaApp.getLangpackFromDir = function(path, locale) {
  var pathBuilder = this.buildResourcePath.bind(this);

  var lp = new Langpack('Gaia', locale, path);
  lp.addResources(pathBuilder);
  return lp;
}

GaiaApp.prototype.getLangpackFromDir = function(dirPath, locale) {
  return this.getModules().then(function(modules) {
    var pathBuilder = this.buildResourcePath.bind(this);
    var lp = new Langpack('Gaia', locale, path);
    lp.addResources(pathBuilder, this.getResourcesFromDir(dirPath));
    return lp;
  }.bind(this));
}

GaiaApp.prototype.getLangpackFromSource = function() {
  return this.getModules().then(function(modules) {
    var pathBuilder = this.buildResourcePath.bind(this);
    var lp = new Langpack('Gecko', this.sourceLocale, this.path);
    lp.addResources(pathBuilder, this.getResources());
    return lp;
  }.bind(this));
};

GaiaApp.prototype.getResourcesFromSource = function() {
  var reFormR = '(' + Object.keys(GaiaApp.resourceFormats).join('|') + ')';
  return this._modules.then(function(modules) {
    var resList = {};

    modules.forEach(function(modulePath) {
      var locPath = path.join(this.path, modulePath, 'locales');
      if (!utils.fileExists(locPath)) {
        return;
      }
      var resIds = utils.ls(locPath, true, new RegExp('\.en-US\.' + reFormR + '$')).map(function(p) {
        var p2 = p.replace('.en-US.', '.');
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
  var reFormR = '(' + Object.keys(GaiaApp.resourceFormats).join('|') + ')';

  return this._modules.then(function(modules) {
    var resList = [];

    modules.forEach(function(modulePath) {
      var locPath = path.join(dirPath, modulePath);
      
      if (!utils.fileExists(locPath)) {
        return;
      }
      var resIds = utils.ls(locPath, true, new RegExp(reFormR + '$')).map(function(p) {
        return {id: modulePath + ':' + path.relative(locPath, p),
                path: path.join(dirPath, modulePath, path.relative(locPath, p))};
      }.bind(this));
      resIds.forEach(function(resId) {
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

GaiaApp.prototype.buildResourcePath = function(relResPath) {
  var pathChunks = utils.splitPath(relResPath);

  if (pathChunks[0] === 'apps') {
    if (pathChunks[1] === 'communications') {
      pathChunks.splice(3, 0, 'locales');
    } else if (pathChunks[1] === 'system') {
      pathChunks.splice(pathChunks.length - 1 , 0, 'locales');
    } else {
      pathChunks.splice(2, 0, 'locales');
    }
  } else if (pathChunks[0] === 'shared') {
    if (pathChunks[1] === 'elements') {
      pathChunks.splice(3, 0, 'locales');
    } else {
      pathChunks.splice(1, 0, 'locales');
    }
  }

  return path.join(this.path, path.join.apply(null, pathChunks));
};

GaiaApp.prototype.getModules = function() {
  return this._modules || (this._modules = 
    collectModules(this.path, 'apps'));
}

/* Helper functions */

function collectModules(gaiaPath, modulePath) {
  var modulesPath = path.join(gaiaPath, modulePath);
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
            modules.push(path.join(modulePath, path.relative(modulesPath, path.join(manTuple[0], e))));
          });
        } else {
          modules.push(path.join(modulePath, path.relative(modulesPath, manTuple[0])));
        }
      });
      resolve(modules);
    });
  });
}

function collectResourceIds(sourcePath, sourceLocale) {
  var appsPath = path.join(sourcePath, 'apps');
 
  var apps = utils.getDirectories(appsPath);

  var paths = [];

  apps.forEach(function(app) {
    var appPath = getAppLocaleFiles(
      sourcePath,
      sourceLocale,
      path.join('apps', path.basename(app)));

    paths = paths.concat(appPath);
  });

  var sharedPaths = getAppLocaleFiles(
    sourcePath, sourceLocale, path.join('shared'));
  paths = paths.concat(sharedPaths);

  var elementsPath = path.join(sourcePath, 'shared', 'elements');
  var elements = utils.getDirectories(elementsPath);
  elements.forEach(function(element) {
    var elementPath = getAppLocaleFiles(
      sourcePath,
      sourceLocale,
      path.join('shared', 'elements', path.basename(element)));

    paths = paths.concat(elementPath);
  });

  var ids = paths.map(function(p) {
    return p
      .replace('.' + sourceLocale + '.', '.{locale}.')
      .replace('/locales/', '/');
  });
  return ids;
}

function getAppLocaleFiles(sourcePath, sourceLocale, appPath) {
  var fullAppPath = path.join(sourcePath, appPath);
  
  var paths = [];
  var resourceFormats = Object.keys(GaiaApp.resourceFormats).join('|');
  var fileFilter =
    new RegExp('.' + sourceLocale + '.(' + resourceFormats + ')$');

  if (utils.fileExists(path.join(fullAppPath, 'locales'))) {
    paths = utils.ls(path.join(fullAppPath, 'locales'), true, fileFilter);
  }

  var dirs = utils.getDirectories(fullAppPath);

  dirs.forEach(function(dir) {
    if (utils.fileExists(path.join(dir, 'locales'))) {
      paths = paths.concat(
        utils.ls(path.join(dir, 'locales'), true, fileFilter));
    }
  });

  return paths.map(function(p) {
    return path.relative(sourcePath, p);
  });
}

exports.App = GaiaApp;
