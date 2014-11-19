'use strict';

var calculateStatsForLangpackDiff =
  require('../stats').calculateStatsForLangpackDiff;
var levels = require('../levels');

function serializeLangpackDiff(lpDiff) {
  var str = '';

  var stats = calculateStatsForLangpackDiff(lpDiff);

  lpDiff.entries.forEach(function (entry) {
    if (entry[1] === 'missing') {
      str += entry[2].replace('{locale}', lpDiff.code) +
        '\n    // add and localize this file\n';
    } else if (entry[1] === 'obsolete') {
      str += entry[2].replace('{locale}', lpDiff.code) +
        '\n    // remove this file\n';
    } else {
      var str2 = serializeResourceDiffToText(entry[3]);
      if (str2) {
        str += entry[2].replace('{locale}', lpDiff.code) + '\n';
        str += str2;
      }
    }
  });

  str += '==================\n';
  str += 'unchanged: ' + stats.unchanged + '\n';
  str += 'changed: ' + stats.changed + '\n';
  if (stats.obsolete) {
    str += 'obsolete: ' + stats.obsolete + '\n';
  }
  if (stats.missing) {
    str += 'missing: ' + stats.missing + '\n';
  }
  if (stats.malformed) {
    str += 'malformed: ' + stats.malformed + '\n';
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

  var goodEntries = stats.unchanged + stats.changed + stats.missing;
  var changePerc = parseInt(stats.changed / goodEntries * 100);
  str += changePerc + '% of entries changed';

  return str;
}

function serializeResourceDiffToText(resDiff) {
  var str = '';

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

  entryDiff.elements.forEach(function(entry) {
    var key = entry[3] ? '.' + entry[3] : 'value';
    if (entry[1] === 'missing') {
      if (!entityIdDisplayed) {
        str += '    ~' + entryDiff.id + '\n';
        entityIdDisplayed = true;
      }
      str += '        +' +key + '\n';
    } else if (entry[1] === 'obsolete') {
      if (!entityIdDisplayed) {
        str += '    ~' + entryDiff.id + '\n';
        entityIdDisplayed = true;
      }
      str += '        -' + key + '\n';
    } else {
      str += '';
    }
  });

  entryDiff.messages.forEach(function(msg) {
    var key = msg[3] ? '.' + msg[3] : 'value';
    if (!entityIdDisplayed) {
      str += '    ~' + entryDiff.id + '\n';
      entityIdDisplayed = true;
    }
    str += '        !' + key + ' ' + levels.getLabel(msg[1]) + ': ' +
      msg[4] + '\n';
  });

  return str;
}

exports.serializeLangpackDiff = serializeLangpackDiff;
