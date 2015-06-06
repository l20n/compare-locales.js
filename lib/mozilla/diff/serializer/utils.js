'use strict';
var path = require('path');

function sortEntries(a, b) {
  if (a[2] < b[2]) {
    return -1;
  }
  if (a[2] > b[2]) {
    return 1;
  }
  return 0;
}

function isEntryEmpty(entry) {
  if (entry[1] !== 'present') {
    return false;
  }

  for (var i in entry[3].entries) {
    var entity = entry[3].entries[i];
    if (entity[1] !== 'present') {
      return false;
    }
    if (entity[3].messages.length !== 0) {
      return false;
    }
  }
  return true;
}

function collapseCommon(struct) {
  var key;

  for (key in struct) {
    var sub = struct[key];
    if (sub !== null &&
        !Array.isArray(sub) && typeof sub === 'object') {
      var ret = collapseCommon(struct[key]);
      if (ret[0]) {
        var newKey = key + path.sep + ret[0];
        struct[newKey] = ret[1];
        delete struct[key];
      }
    }
  }

  if (Object.keys(struct).length === 1) {
    key = Object.keys(struct)[0];
    return [key, struct[key]];
  }

  return [null, struct];
}

exports.createStructuredDiff = function(entries) {
  var struct = {};

  entries = entries.filter(function(entry) {
    return !isEntryEmpty(entry);
  });

  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];

    var chunks = entry[2].split(path.sep);

    var root = struct;
    for (var j = 0; j < chunks.length; j++) {
      var chunk = chunks[j];
      if (!(chunk in root)) {
        if (j == chunks.length - 1) {
          root[chunk] = entry;
        } else {
          root[chunk] = {};
        }
      }
      root = root[chunk];
    }
  }

  return collapseCommon(struct)[1];
}
