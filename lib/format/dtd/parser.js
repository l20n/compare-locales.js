'use strict';

var L10nError = require('../errors').L10nError;

var DTDParser = {
  _patterns: {
    entity: /<\!ENTITY\s*([^\s]+)\s+"([^"]*)"\s*>/g,
  },

  parse: function(source) {

    var entities = [];

    var match;

    while (match = this._patterns.entity.exec(source)) {
      entities.push({
        '$i': match[1],
        '$v': match[2]
      });
    }

    return entities;
  },
};

module.exports = DTDParser;
