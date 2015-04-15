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
          value.missingEntity = missingEntries;
        }
        if (obsoleteEntries.length) {
          value.obsoleteEntity = obsoleteEntries;
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

  summary.unchanged = stats.unchanged;
  summary.changed = stats.changed;
  summary.obsolete = stats.obsolete;
  summary.missing = stats.missing;
  summary.missingInFiles = stats.missingInFiles;
  summary.malformed = stats.malformed;

  obj.summary['null'] = summary;

  return JSON.stringify(obj, null);
}

exports.serializeLangpackDiff = serializeLangpackDiff;
