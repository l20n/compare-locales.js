'use strict';

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

exports.calculateStatsForLangpackDiff = calculateStatsForLangpackDiff;
