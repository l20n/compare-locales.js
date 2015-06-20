'use strict';

var levels = require('./levels');

var Stats = function() {
  this.unchanged = 0;
  this.changed = 0;
  this.obsolete = 0;
  this.missing = 0;
  this.infos = 0;
  this.warnings = 0;
  this.errors = 0;
  this.critical = 0;
  this.entries = 0;
  this.missingInFiles = 0;
};

Stats.prototype.add = function(stats2) {
  this.unchanged += stats2.unchanged;
  this.changed += stats2.changed;
  this.obsolete += stats2.obsolete;
  this.missing += stats2.missing;
  this.infos += stats2.infos;
  this.warnings += stats2.warnings;
  this.errors += stats2.errors;
  this.critical += stats2.critical;
  this.entries += stats2.entries;
  this.missingInFiles += stats2.missingInFiles;
};


function calculateStatsForLangpackDiff(lpDiff) {
  var stats = new Stats();

  lpDiff.entries.forEach(function (entry) {
    if (entry[1] === 'present' || entry[1] === 'missing') {
      var resStats = calculateStatsForResourceDiff(entry[3], entry[1]);
      stats.add(resStats);
    }
  });

  return stats;
}

function calculateStatsForResourceDiff(resDiff, type) {
  var stats = new Stats();

  stats.errors += resDiff.errors.length;

  resDiff.entries.forEach(function (entry) {
    stats.entries++;

    if (entry[1] === 'missing') {
      if (type === 'present') {
        stats.missing++;
      } else {
        stats.missingInFiles++;
      }
    } else if (entry[1] === 'obsolete') {
      stats.obsolete++;
    } else {
      var entryStats = calculateStatsForEntryDiff(entry[3]);
      stats.add(entryStats);
    }
  });

  return stats;
}

function calculateStatsForEntryDiff(entryDiff) {
  var stats = new Stats();

  var isUnchanged = true;

  entryDiff.elements.forEach(function(entry) {
    if (entry[1] === 'missing') {
      isUnchanged = false;
    } else if (entry[1] === 'obsolete') {
      isUnchanged = false;
    } else if (entry[1] === 'changed') {
      isUnchanged = false;
    }
  });

  entryDiff.messages.forEach(function(msg) {
    switch (msg[1]) {
      case levels.INFO:
        stats.infos++;
        break;
      case levels.WARNING:
        stats.warnings++;
        break;
      case levels.ERROR:
        stats.errors++;
        break;
      case levels.CRITICAL:
        stats.critical++;
    }
  });

  if (isUnchanged) {
    stats.unchanged++;
  } else {
    stats.changed++;
  }

  return stats;
}

exports.calculateStatsForLangpackDiff = calculateStatsForLangpackDiff;
