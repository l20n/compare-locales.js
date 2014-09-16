'use strict';

var Langpack = require('./langpack.js').Langpack;


function LangpackDiff(code) {
  this.code = code;
  this.entries = [];
}

function ResourceDiff() {
  this.entries = [];
}

function EntryDiff() {
  this.elements = [];
}


function serializeLangpackDiffToText(lpDiff) {
  var str = '';

  lpDiff.entries.forEach(function (entry) {
    str += entry[1].replace('{locale}', lpDiff.code) + '\n';
    if (entry[0] === 'missing') {
      str += '  missing resource\n';
    } else {
      str += serializeResourceDiffToText(entry[2]);
    }
  });

  str += 'unchanged: ' + 0 + '\n';
  str += 'changed: ' + 0 + '\n';
  str += 'obsolete: ' + 0 + '\n';
  str += 'missing: ' + 0 + '\n';
  str += 0 + '% of entries changed';

  return str;
}

function serializeResourceDiffToText(resDiff) {
  var str = '';

  resDiff.entries.forEach(function (entry) {
    if (entry[0] === 'missing') {
      str += '    +' +entry[1]+ '\n';
    } else {
      str += serializeEntryDiffToText(entry[2]);
    }
  });

  return str;
}

function serializeEntryDiffToText(entryDiff) {
  var str = '';

  entryDiff.elements.forEach(function (entry) {
    if (entry[0] === 'missing') {
      str += '    +' +entry[2] + '\n';
    } else {
      str += '';
    }
  });

  return str;
}

exports.LangpackDiff = LangpackDiff;
exports.ResourceDiff = ResourceDiff;
exports.EntryDiff = EntryDiff;
exports.serializeLangpackDiffToText = serializeLangpackDiffToText;
