'use strict';

var levels = require('../levels');
var calculateStatsForLangpackDiff =
  require('../stats').calculateStatsForLangpackDiff;
var serializerUtils = require('./utils');

function buildIndent(indent) {
  var str = '';
  for (var i = 0; i < indent; i++) {
    str += '  ';
  }
  return str;
}

function printStructuredDiff(diff, indent) {
  if (!indent) {
    indent = 0;
  }
  var str = '';

  if (Array.isArray(diff)) {
    str += printEntryDiff(diff[2], diff, 0);
    return str;
  }

  var keys = Object.keys(diff).sort();
  for (var i in keys) {
    var key = keys[i];
    var val = diff[key];
    if (Array.isArray(val)) {
      str += printEntryDiff(key, val, indent);
    } else if (typeof val === 'object') {
      var str2 = printStructuredDiff(val, indent + 1);
      str += buildIndent(indent) + key + '\n';
      str += str2;
    }
  }
  return str;
}

function printEntryDiff(key, entry, indent) {
  var str = buildIndent(indent) + key.replace('.{locale}', '') + '\n';

  if (entry[1] === 'missing') {
    str += buildIndent(indent + 2) + '// add and localize this file\n';
  } else if (entry[1] === 'obsolete') {
    str += buildIndent(indent + 2) + '// remove this file\n';
  } else if (entry[1] === 'error') {
    str += buildIndent(indent + 2) + 'ERROR: ' + entry[3] + '\n';
  } else {
    var str2 = serializeResourceDiffToText(entry[3], indent);
    str += buildIndent(indent + 2) +
      str2.replace(/\n/g, '\n' + buildIndent(indent)).trim() + '\n';
  }
  return str;
}

function serializeLangpackDiff(lpDiff) {
  var str = '';

  var stats = calculateStatsForLangpackDiff(lpDiff);

  lpDiff.entries.sort(serializerUtils.sortEntries);

  var structuredDiff = serializerUtils.createStructuredDiff(lpDiff.entries);

  str = printStructuredDiff(structuredDiff);

  if (stats.changed) {
    str += 'changed: ' + stats.changed + '\n';
  }
  if (stats.missing) {
    str += 'missing: ' + stats.missing + '\n';
  }
  if (stats.missingInFiles) {
    str += 'missingInFiles: ' + stats.missingInFiles + '\n';
  }
  if (stats.obsolete) {
    str += 'obsolete: ' + stats.obsolete + '\n';
  }
  if (stats.unchanged) {
    str += 'unchanged: ' + stats.unchanged + '\n';
  }

  if (stats.infos) {
    str += 'infos: ' + stats.infos + '\n';
  }
  if (stats.warnings) {
    str += 'warnings: ' + stats.warnings + '\n';
  }
  if (stats.errors) {
    str += 'errors: ' + stats.errors + '\n';
  }
  if (stats.critical) {
    str += 'critical: ' + stats.critical + '\n';
  }

  var goodEntries = stats.unchanged + stats.changed + stats.missing + stats.missingInFiles;
  var changePerc = parseInt(stats.changed / goodEntries * 100);
  str += changePerc + '% of entries changed';

  return str;
}

function serializeResourceDiffToText(resDiff) {
  var str = '';

  resDiff.entries.sort(serializerUtils.sortEntries);
  resDiff.entries.forEach(function (entry) {
    if (entry[1] === 'missing') {
      str += '    +' +entry[2]+ '\n';
    } else if (entry[1] === 'obsolete') {
      str += '    -' +entry[2]+ '\n';
    } else {
      str += serializeEntryDiffToText(entry[3]);
    }
  });

  return str;
}

function serializeEntryDiffToText(entryDiff) {
  var str = '';

  var entityIdDisplayed = false;

  entryDiff.messages.forEach(function(msg) {
    var key = msg[3] ? '.' + msg[3] : 'value';
    if (!entityIdDisplayed) {
      str += '    ~' + entryDiff.id + '\n';
      entityIdDisplayed = true;
    }
    str += '        ' + levels.getLabel(msg[1]) + ': ' +
      msg[4] + '\n';
  });

  return str;
}

exports.serializeLangpackDiff = serializeLangpackDiff;
