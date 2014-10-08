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

  var stats = calculateStatsForLangpackDiff(lpDiff);

  lpDiff.entries.forEach(function (entry) {
    str += entry[1].replace('{locale}', lpDiff.code) + '\n';
    if (entry[0] === 'missing') {
      str += '  missing resource\n';
    } else {
      str += serializeResourceDiffToText(entry[2]);
    }
  });

  str += 'unchanged: ' + stats.unchanged + '\n';
  str += 'changed: ' + stats.changed + '\n';
  str += 'obsolete: ' + stats.obsolete + '\n';
  str += 'missing: ' + stats.missing + '\n';

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

  entryDiff.elements.forEach(function (entry) {
    if (entry[0] === 'missing') {
      str += '    +' +entry[2] + '\n';
    } else {
      str += '';
    }
  });

  return str;
}

function calculateStatsForLangpackDiff(lpDiff) {
  var stats = {
    'unchanged': 0,
    'changed': 0,
    'missing': 0,
    'obsolete': 0,
    'entries': 0,
  };

  lpDiff.entries.forEach(function (entry) {
    if (entry[0] === 'missing') {
    } else {
      var resStats = calculateStatsForResourceDiff(entry[2]);
      stats.unchanged += resStats.unchanged;
      stats.changed += resStats.changed;
      stats.missing += resStats.missing;
      stats.obsolete += resStats.obsolete;
      stats.entries += resStats.entries;
    }
  });

  return stats;
}

function calculateStatsForResourceDiff(resDiff) {
  var stats = {
    'unchanged': 0,
    'changed': 0,
    'missing': 0,
    'obsolete': 0,
    'entries': 0,
  };

  resDiff.entries.forEach(function (entry) {
    stats.entries++;

    if (entry[0] === 'missing') {
      stats.missing++;

    } else if (entry[0] === 'obsolete') {
      stats.obsolete++;
    } else {
      var entryStats = calculateStatsForEntryDiff(entry[2]);
      stats.unchanged += entryStats.unchanged;
      stats.changed += entryStats.changed;
      stats.missing += entryStats.missing;
      stats.obsolete += entryStats.obsolete;
      stats.entries += entryStats.entries;
    }
  });

  return stats;
}

function calculateStatsForEntryDiff(entryDiff) {
  var stats = {
    'unchanged': 0,
    'changed': 0,
    'missing': 0,
    'obsolete': 0,
    'entries': 0,
  };

  entryDiff.elements.forEach(function (entry) {
    if (entry[0] === 'missing') {
    } else if (entry[0] === 'changed') {
      stats.changed++;
    } else if (entry[0] === 'unchanged') {
      stats.unchanged++;
    }
  });

  return stats;
}


exports.LangpackDiff = LangpackDiff;
exports.ResourceDiff = ResourceDiff;
exports.EntryDiff = EntryDiff;
exports.serializeLangpackDiffToText = serializeLangpackDiffToText;
