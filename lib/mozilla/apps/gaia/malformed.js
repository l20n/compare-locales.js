'use strict';

var listDiff = require('../../diff/index').listDiff;
var levels = require('../../diff/levels');


function isResolvable(field) {
  if (field.value.type === 'String') {
    return true;
  } else if (field.index !== null) {
    return true;
  }
  return false;
}

function valueDiff(val1, val2) {
  var result = [];

  var name = 'value';

  if (val1.value !== null && val2.value === null) {
    result.push(['malformed', levels.ERROR, null, null, 'value missing in translation']);
  } else if (val1.value === null && val2.value !== null) {
    result.push(['malformed', levels.WARNING, null, null, 'value obsolete in translation']);
  } else if (isResolvable(val1) && !isResolvable(val2)) {
    result.push(['malformed', levels.ERROR, null, null, 'value resolvable in source but not in translation']);
  } else if (!isResolvable(val1) && isResolvable(val2)) {
    result.push(['malformed', levels.ERROR, null, null, 'value not resolvable in source but resolvable in translation']);
  }
  return result;
}

function getAttr(attrs, key) {
  for (var i in attrs) {
    if (attrs[i].id.name === key) {
      return attrs[i];
    }
  }
  return null;
}

function main(source, translation, callback) {
  var result = [];

  result.concat(valueDiff(source, translation));

  var sourceAttrsKeys = source.attrs.map(function(attr) {return attr.id.name});
  var translAttrsKeys = translation.attrs.map(function(attr) {return attr.id.name});

  var diff = listDiff(sourceAttrsKeys, translAttrsKeys);

  if (diff.length) {
    diff.forEach(function(entry) {
      if (entry[1] === 'list2') {
        result.push(['malformed', levels.WARNING, null, null, 'attribute `' + entry[0] + '` obsolete in translation']);
      } else if (entry[1] === 'list1') {
        result.push(['malformed', levels.ERROR, null, null, 'attribute `' + entry[0] + '` missing in translation']);
      } else if (isResolvable(getAttr(source.attrs, entry[0])) &&
                 !isResolvable(getAttr(translation.attrs, entry[0]))) {
    result.push(['malformed', levels.ERROR, null, null, 'attribute `' + entry[0] + '` resolvable in source but not in translation']);
      } else if (!isResolvable(getAttr(source.attrs, entry[0])) &&
                 isResolvable(getAttr(translation.attrs, entry[0]))) {
    result.push(['malformed', levels.ERROR, null, null, 'attribute `' + entry[0] + '` not resolvable in source but resolvable in translation']);
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
