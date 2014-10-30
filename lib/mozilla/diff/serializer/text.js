'use strict';

var calculateStatsForLangpackDiff =
  require('../core.js').calculateStatsForLangpackDiff;

function serializeLangpackDiff(lpDiff) {
  var str = '';

  var stats = calculateStatsForLangpackDiff(lpDiff);

  lpDiff.entries.forEach(function (entry) {
    if (entry[0] === 'missing') {
      str += entry[1].replace('{locale}', lpDiff.code) +
        '\n    // add and localize this file\n';
    } else if (entry[0] === 'obsolete') {
      str += entry[1].replace('{locale}', lpDiff.code) +
        '\n    // remove this file\n';
    } else {
      var str2 = serializeResourceDiffToText(entry[2]);
      if (str2) {
        str += entry[1].replace('{locale}', lpDiff.code) + '\n';
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

  var goodEntries = stats.unchanged + stats.changed + stats.missing;
  var changePerc = parseInt(stats.changed / goodEntries * 100);
  str += changePerc + '% of entries changed';

  return str;
}

function serializeResourceDiffToText(resDiff) {
  var str = '';

  resDiff.entries.forEach(function (entry) {
    if (entry[0] === 'missing') {
      str += '    +' +entry[1]+ '\n';
    } else if (entry[0] === 'obsolete') {
      str += '    -' +entry[1]+ '\n';
    } else {
      str += serializeEntryDiffToText(entry[2]);
    }
  });

  return str;
}

function serializeEntryDiffToText(entryDiff) {
  var str = '';

  var entityIdDisplayed = false;

  entryDiff.elements.forEach(function (entry) {
    var key = entry[1] === 'attribute' ? entry[2] : '>>value<<';
    if (entry[0] === 'missing') {
      if (!entityIdDisplayed) {
        str += '    ~' + entryDiff.id + '\n';
        entityIdDisplayed = true;
      }
      str += '        +' +key + '\n';
    } else if (entry[0] === 'obsolete') {
      if (!entityIdDisplayed) {
        str += '    ~' + entryDiff.id + '\n';
        entityIdDisplayed = true;
      }
      str += '        -' + key + '\n';
    } else {
      str += '';
    }
  });

  return str;
}

exports.serializeLangpackDiff = serializeLangpackDiff;
