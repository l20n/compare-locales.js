'use strict';

var utils = require('../mozilla/utils');
var appUtils = require('../mozilla/apps/utils');

var GaiaPropertiesEntries = require('../format/gaia_properties_entries');
var GeckoPropertiesParser = require('../format/gecko_properties');
var L20nParser = require('../format/l20n');
var GeckoDTDParser = require('../format/dtd');

var parsers = {
  'l20n': L20nParser,
  'gaia_properties': GaiaPropertiesEntries,
  'gecko_properties': GeckoPropertiesParser,
  'gecko_dtd': GeckoDTDParser,
};

exports.getResource = function(appType, resPath) {
  var App = appUtils.getApp(appType);
  var type = resPath.substring(resPath.lastIndexOf('.') + 1);

  var parser = App.resourceFormats[type];
  if (!parsers[parser]) {
    return {};
  }
  var getEntries = parsers[parser].getEntries.bind(parsers[parser]);

  return utils.getFileContent(resPath).then(getEntries);
};
