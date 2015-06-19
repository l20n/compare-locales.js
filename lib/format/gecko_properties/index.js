'use strict';

var GeckoPropertiesParser = require('./parser');

function getEntries(source) {
  var ast = GeckoPropertiesParser.parse(source);

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
  return [null, entries];
}

exports.getEntries = getEntries;


