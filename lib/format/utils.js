'use strict';

var utils = require('../mozilla/utils.js');

var PropertiesParser = require('../format/properties.js');
var L20nParser = require('../format/l20n.js').L20nParser;

var parsers = {
  'l20n': new L20nParser(),
  'properties': PropertiesParser
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

exports.getResource = function(resPath) {
  var type = resPath.substring(resPath.lastIndexOf('.') + 1);
  var parse = parsers[type].parse.bind(parsers[type]);

  return utils.getFileContent(resPath).then(parse).then(getEntries);
};

exports.getEntries = getEntries;
