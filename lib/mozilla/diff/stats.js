'use strict';

var levels = require('./levels');

var Stats = function() {
  this.unchanged = 0;
  this.malformed = 0;
  this.changed = 0;
  this.obsolete = 0;
  this.missing = 0;
  this.infos = 0;
  this.warnings = 0;
  this.errors = 0;
  this.entries = 0;
};

Stats.prototype.add = function(stats2) {
  this.unchanged += stats2.unchanged;
  this.malformed += stats2.malformed;
  this.changed += stats2.changed;
  this.obsolete += stats2.obsolete;
  this.missing += stats2.missing;
  this.infos += stats2.infos;
  this.warnings += stats2.warnings;
  this.errors += stats2.errors;
  this.entries += stats2.entries;
};


function calculateStatsForLangpackDiff(lpDiff) {
  var stats = new Stats();

  lpDiff.entries.forEach(function (entry) {
    if (entry[1] === 'present') {
      var resStats = calculateStatsForResourceDiff(entry[3]);
      stats.add(resStats);
    }
  });

  return stats;
}

function calculateStatsForResourceDiff(resDiff) {
  var stats = new Stats();

  resDiff.entries.forEach(function (entry) {
    stats.entries++;

    if (entry[1] === 'missing') {
      stats.missing++;

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
  var isMalformed = false;

  entryDiff.elements.forEach(function(entry) {
    if (entry[1] === 'missing') {
      isMalformed = true;
      isUnchanged = false;
    } else if (entry[1] === 'obsolete') {
      isMalformed = true;
    } else if (entry[1] === 'changed') {
      isUnchanged = false;
    //} else if (entry[1] === 'unchanged') {
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
    }
  });

  if (isUnchanged) {
    stats.unchanged++;
  } else {
    stats.changed++;
  }

  if (isMalformed) {
    stats.malformed++;
  }

  return stats;
}

exports.calculateStatsForLangpackDiff = calculateStatsForLangpackDiff;
