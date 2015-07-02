'use strict';

var levels = require('../../diff/levels');


function checkValue(val) {
  var ret = [];
  if (typeof(val) === 'string') {
    val = val.replace(/\\\\/g, '');
    var pattern = /\\([^unrt\\])/g;

    var match;
    while (match = pattern.exec(val)) {
      ret.push('unknown escape sequence, ' + match[0] + ' at pos ' + match.index);
    }
  }

  if (Array.isArray(val)) {
    for (var i = 0; i < val.length; i++) {
      if (typeof(val[i]) === 'string') {
        ret.concat(checkValue(val[i]));
      }
    }
  }

  if (typeof(val) === 'object') {
    for (var i in val) {
      ret.concat(checkValue(val[i]));
    }
  }
  return ret;
}

function main(source, translation, callback) {
  var result = [];

  if (translation.value !== null) {
    var rets = checkValue(translation.value);
    rets.forEach(function(ret) {
      result.push(['escapes', levels.WARNING, null, null, ret]);
    });
  }

  if (translation.attrs) {
    for (var key in translation.attrs) {
      var attr = translation.attrs[key];
      var rets = checkValue(attr);
      rets.forEach(function(ret) {
        result.push(['escapes', levels.WARNING, null, null, ret]);
      });
    };
  }

  if (result.length) {
    callback(result);
  }
}

module.exports = function(evt) {
  // don't do anything if the user doesn't want to see errors
  if (evt.severity > levels.ERROR) {
    return;
  }

  main(evt.entry1, evt.entry2, evt.callback);
};
