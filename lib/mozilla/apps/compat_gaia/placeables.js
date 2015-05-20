'use strict';

var listDiff = require('../../diff/index').listDiff;
var levels = require('../../diff/levels');

function getPlaceables(val) {
  if (typeof val === 'string') {
    return [];
  }

  var isPlacable = function(part) {
    return part.t === 'idOrVar';
  };

  var getIdentifier = function(part) {
    return part.v;
  };

  return val.filter(isPlacable).map(getIdentifier);
}

function getFromDiff(list, diff) {
  return diff
    .filter(function(elem) { return elem[1] === list; })
    .map(function(elem) { return elem[0]; });
}

function verifyValues(val1, val2) {
  // We can only verify simple strings (represented as strings in the AST) and 
  // complex strings (represented as arrays).
  if (val1.length === undefined || val2.length === undefined) {
    return [];
  }

  var diff = listDiff(getPlaceables(val1), getPlaceables(val2));
  var missing = getFromDiff('list1', diff);
  var superflous = getFromDiff('list2', diff);

  var warnings = [];
  if (missing.length) {
    warnings.push('Missing placeables: ' + missing.join(', ') + '.');
  }
  if (superflous.length) {
    warnings.push('Unknown placeables: ' + superflous.join(', ') + '.');
  }

  return warnings;
}


function main(source, translation, callback) {
  var result = [];

  var pushResult = function(elem, name, msg) {
    result.push(['placeables', levels.ERROR, elem, name, msg]);
  };

  if (source.value && translation.value) {
    verifyValues(source.value, translation.value).forEach(
      pushResult.bind(null, 'value', null));
  }

  for (var name in translation.attrs) {
    if (!source.attrs || !(name in source.attrs)) {
      continue;
    }

    verifyValues(source.attrs[name], translation.attrs[name]).forEach(
      pushResult.bind(null, 'attribute', name));
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
