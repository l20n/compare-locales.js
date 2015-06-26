'use strict';

var L20nParser = require('./parser');

function getValue(value) {
  if (value.type === 'String') {
    return value.source;
  }

  if (value.type === 'Hash') {
    return value;
  }
}

function getEntries(source) {
  var resource = L20nParser.parse(source);

  var entries = {};

  for (var i = 0; i < resource.body.length; i++) {
    var entry = resource.body[i];
    if (entry.type === 'Entity') {
      entries[entry.id.name] = {
        id: entry.id.name,
        value: getValue(entry.value),
        index: entry.index
      };
    }
  }
  return [null, entries];
}

exports.getEntries = getEntries;



