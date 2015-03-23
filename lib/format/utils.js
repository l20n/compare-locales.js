'use strict';

var utils = require('../mozilla/utils');
var appUtils = require('../mozilla/apps/utils');

var GaiaProperties = require('./gaia_properties');
var GeckoProperties = require('./gecko_properties');
var L20n = require('./l20n');
var GeckoDTD = require('./dtd');

var formats = {
  'l20n': L20n,
  'gaia_properties': GaiaProperties,
  'gecko_properties': GeckoProperties,
  'gecko_dtd': GeckoDTD,
};

exports.getResource = function(appType, resPath) {
  var App = appUtils.getApp(appType);
  var type = resPath.substring(resPath.lastIndexOf('.') + 1);

  var format = App.resourceFormats[type];
  if (!formats[format]) {
    return {};
  }
  var getEntries = formats[format].getEntries.bind(formats[format]);

  return utils.getFileContent(resPath).then(getEntries);
};
