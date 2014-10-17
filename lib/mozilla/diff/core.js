'use strict';

function LangpackDiff(code) {
  this.code = code;
  this.entries = [];
}

function ResourceDiff() {
  this.entries = [];
}

function EntryDiff(id) {
  this.id = id;
  this.elements = [];
}

var Stats = function() {
  this.unchanged = 0;
  this.malformed = 0;
  this.changed = 0;
  this.obsolete = 0;
  this.missing = 0;
  this.entries = 0;
};

Stats.prototype.add = function(stats2) {
  this.unchanged += stats2.unchanged;
  this.malformed += stats2.malformed;
  this.changed += stats2.changed;
  this.obsolete += stats2.obsolete;
  this.missing += stats2.missing;
  this.entries += stats2.entries;
};


function calculateStatsForLangpackDiff(lpDiff) {
  var stats = new Stats();

  lpDiff.entries.forEach(function (entry) {
    if (entry[0] !== 'missing') {
      var resStats = calculateStatsForResourceDiff(entry[2]);
      stats.add(resStats);
    }
  });

  return stats;
}

function calculateStatsForResourceDiff(resDiff) {
  var stats = new Stats();

  resDiff.entries.forEach(function (entry) {
    stats.entries++;

    if (entry[0] === 'missing') {
      stats.missing++;

    } else if (entry[0] === 'obsolete') {
      stats.obsolete++;
    } else {
      var entryStats = calculateStatsForEntryDiff(entry[2]);
      stats.add(entryStats);
    }
  });

  return stats;
}

function calculateStatsForEntryDiff(entryDiff) {
  var stats = new Stats();

  var isUnchanged = true;
  var isMalformed = false;

  entryDiff.elements.forEach(function (entry) {
    if (entry[0] === 'missing') {
      isMalformed = true;
      isUnchanged = false;
    } else if (entry[0] === 'obsolete') {
      isMalformed = true;
    } else if (entry[0] === 'changed') {
      isUnchanged = false;
    //} else if (entry[0] === 'unchanged') {
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


exports.LangpackDiff = LangpackDiff;
exports.ResourceDiff = ResourceDiff;
exports.EntryDiff = EntryDiff;

exports.calculateStatsForLangpackDiff = calculateStatsForLangpackDiff;
