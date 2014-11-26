'use strict';

var utils = require('../mozilla/utils');
var appUtils = require('../mozilla/apps/utils');

var GaiaPropertiesParser = require('../format/gaia_properties');
var L20nParser = require('../format/l20n');

var parsers = {
  'l20n': L20nParser,
  'gaia_properties': GaiaPropertiesParser,
  'gecko_properties': GaiaPropertiesParser,
};

function getEntries(ast) {
  var entries = {};

  for (var i = 0; i < ast.length; i++) {
    var entry = {
      value: null,
      attrs: null,
      index: null,
    };
    for (var key in ast[i]) {
      switch(key) {
        case '$v':
          entry.value = ast[i].$v;
          break;
        case '$i':
          break;
        case '$x':
          entry.index = ast[i].$x;
          break;
        default:
          if (!entry.attrs) {
            entry.attrs = {};
          }
          entry.attrs[key] = ast[i][key];
      }
    }
    entries[ast[i].$i] = entry;
  }
  return entries;
}

exports.getResource = function(appType, resPath) {
  var App = appUtils.getApp(appType);
  var type = resPath.substring(resPath.lastIndexOf('.') + 1);

  var parser = App.resourceFormats[type];
  var parse = parsers[parser].parse.bind(parsers[parser]);

  return utils.getFileContent(resPath).then(parse).then(getEntries);
};

exports.getEntries = getEntries;
