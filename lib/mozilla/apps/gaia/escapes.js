'use strict';

var levels = require('../../diff/levels');

var pattern = /\\([^unrt\\])/;

function checkValue(val) {
  if (typeof(val) === 'string') {
    val = val.replace(/\\\\/g, '');
    var match = val.match(pattern);
    if (match) {
      return 'unknown escape sequence, ' + match[0];
    }
    return false;
  }

  if (Array.isArray(val)) {
    for (var i = 0; i < val.length; i++) {
      if (typeof(val[i]) === 'string') {
        var ret = checkValue(val[i]);
        if (ret) {
          return ret;
        }
      }
    }
    return false;
  }

  if (typeof(val) === 'object') {
    for (var i in val) {
      var ret = checkValue(val[i]);
      if (ret) {
        return ret;
      }
    }
    return false;
  }
}

function main(source, translation, callback) {
  var result = [];

  if (translation.value !== null) {
    var ret = checkValue(translation.value);
    if (ret) {
      result.push(['escapes', levels.WARNING, null, null, ret]);
    }
  }

  if (translation.attrs) {
    for (var key in translation.attrs) {
      var attr = translation.attrs[key];
      var ret = checkValue(attr);
      if (ret) {
        result.push(['escapes', levels.WARNING, null, null, ret]);
      }
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
