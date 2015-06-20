'use strict';

var GaiaPropertiesParser = require('./parser');

function getEntries(source) {
  var ast = GaiaPropertiesParser.parse(source);

  var entries = {};
  var errors = [];

  for (var i = 0; i < ast.length; i++) {
    if (ast[i]['$t'] === 'junk') {
      errors.push('Unparsed content "' + ast[i]['$c'] + '" at ' + ast[i]['$p'][0] + '-' + ast[i]['$p'][1]);
      continue;
    }
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

  if (errors) {
    return [errors, entries];
  }
  return [null, entries];
}

exports.getEntries = getEntries;
