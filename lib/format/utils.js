'use strict';

var utils = require('../mozilla/utils');
var appUtils = require('../mozilla/apps/utils');

var formats = {
  'l20n': {
    name: 'l20n',
    module: undefined
  },
  'gaia_properties': {
    name: 'gaia_properties_compat',
    module: undefined
  },
  'gecko_properties': {
    name: 'gecko_properties',
    module: undefined
  },
  'gecko_dtd': {
    name: 'dtd',
    module: undefined
  }
};

function getModule(formatId) {
  if (!formats[formatId]) {
    return undefined;
  }

  if (!formats[formatId].module) {
    formats[formatId].module = require('./' + formats[formatId].name);
  }
  return formats[formatId].module;
}

exports.getResource = function(appType, resPath) {
  var App = appUtils.getApp(appType);
  var type = resPath.substring(resPath.lastIndexOf('.') + 1);

  var formatId = App.resourceFormats[type];
  var module = getModule(formatId);
  var getEntries = module.getEntries.bind(module);

  return utils.getFileContent(resPath).then(getEntries);
};
