'use strict';

var appTypes = {
  'gaia': {
    name: 'gaia',
    module: undefined
  },
  'gecko': {
    name: 'gecko',
    module: undefined
  }
};

exports.getApp = function(appType) {
  if (!appTypes[appType].module) {
    appTypes[appType].module = require('./' + appTypes[appType].name);
  }
  return appTypes[appType].module.App;
};
