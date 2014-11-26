'use strict';

var appTypes = {
  'gaia': require('./gaia'),
  'gecko': require('./gecko')
};

exports.getApp = function(appType) {
  return appTypes[appType].App;
};
