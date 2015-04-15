'use strict';

var listDiff = require('../../diff/index').listDiff;
var levels = require('../../diff/levels');


function isResolvable(field) {
  return typeof(field.value) === 'string' ||
         Array.isArray(field.value) ||
         field.index !== null;
}

function main(source, translation, callback) {
  var result = [];

  if (source.value !== null && translation.value === null) {
    result.push(['malformed', levels.ERROR, null, null, 'value missing in translation']);
  } else if (source.value === null && translation.value !== null) {
    result.push(['malformed', levels.WARNING, null, null, 'value obsolete in translation']);
  } else if (isResolvable(source) && !isResolvable(translation)) {
    result.push(['malformed', levels.ERROR, null, null, 'value resolvable in source but not in translation']);
  } else if (!isResolvable(source) && isResolvable(translation)) {
    result.push(['malformed', levels.ERROR, null, null, 'value not resolvable in source but resolvable in translation']);
  }

  var sourceAttrs = source.attrs === null ? [] : Object.keys(source.attrs);
  var translAttrs = translation.attrs === null ? [] : Object.keys(translation.attrs);

  var diff = listDiff(sourceAttrs, translAttrs);

  if (diff.length) {
    diff.forEach(function(entry) {
      if (entry[1] === 'list2') {
        result.push(['malformed', levels.WARNING, null, null, 'attribute `' + entry[0] + '` obsolete in translation']);
      } else if (entry[1] === 'list1') {
        result.push(['malformed', levels.ERROR, null, null, 'attribute `' + entry[0] + '` missing in translation']);
      }
    });
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
