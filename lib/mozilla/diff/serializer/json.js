'use strict';
'use strict';

var calculateStatsForLangpackDiff =
  require('../stats').calculateStatsForLangpackDiff;

function serializeLangpackDiff(lpDiff) {
  var obj = {
    details: {},
    summary: {},
  };

  var stats = calculateStatsForLangpackDiff(lpDiff);

  var children = [];
  lpDiff.entries.forEach(function (entry) {
    if (entry[1] === 'missing') {
      children.push([
        entry[2], {
          value: {
            'missingFile': 'error',
            'strings': entry[3].entries.length
          }
        }
      ]);
    } else if (entry[1] === 'obsolete') {
      children.push([
        entry[2], {
          value: {
            'obsoleteFile': 'error'
          }
        }
      ]);
    } else {
      var missingEntries = [];
      var obsoleteEntries = [];
      entry[3].entries.forEach(function(e) {
        if (e[1] === 'missing') {
          missingEntries.push(e[2]);
        } else if (e[1] === 'obsolete') {
          obsoleteEntries.push(e[2]);
        }
      });
      if (missingEntries.length || obsoleteEntries.length) {
        var value = {};
        if (missingEntries.length) {
          value.missingEntry = missingEntries;
        }
        if (obsoleteEntries.length) {
          value.obsoleteEntry = obsoleteEntries;
        }
        children.push([
          entry[2], {
            value: value
          }
        ]);
      }
    }
  });

  obj.details.children = children;

  var summary = {};

  if (stats.unchanged) {
    summary.unchanged = stats.unchanged;
  }
  if (stats.changed) {
    summary.changed = stats.changed;
  }
  if (stats.obsolete) {
    summary.obsolete = stats.obsolete;
  }
  if (stats.missing) {
    summary.missing = stats.missing;
  }
  if (stats.missingInFiles) {
    summary.missingInFiles = stats.missingInFiles;
  }
  if (stats.malformed) {
    summary.malformed = stats.malformed;
  }

  obj.summary['null'] = summary;

  return JSON.stringify(obj, null);
}

exports.serializeLangpackDiff = serializeLangpackDiff;
