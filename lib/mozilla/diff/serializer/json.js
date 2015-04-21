'use strict';
'use strict';

var levels = require('../levels');

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
      var errors = [];
      var warnings = [];
      entry[3].entries.forEach(function(e) {
        if (e[1] === 'missing') {
          missingEntries.push(e[2]);
        } else if (e[1] === 'obsolete') {
          obsoleteEntries.push(e[2]);
        } else if (e[1] === 'present') {
          e[3].messages.forEach(function(message) {
            if (parseInt(message[1]) == levels.ERROR) {
              errors.push('In entity ' + e[2] + ': ' + message[4]);
            }
            if (parseInt(message[1]) == levels.WARNING) {
              warnings.push('In entity ' + e[2] + ': ' + message[4]);
            }
          });
        }
      });
      if (missingEntries.length ||
          obsoleteEntries.length ||
          warnings.length ||
          errors.length) {
        var value = {};
        if (missingEntries.length) {
          value.missingEntity = missingEntries;
        }
        if (obsoleteEntries.length) {
          value.obsoleteEntity = obsoleteEntries;
        }
        if (warnings.length) {
          value.warnings = warnings;
        }
        if (errors.length) {
          value.errors = errors;
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
  summary.errors = stats.errors;
  summary.warnings = stats.warnings;

  obj.summary['null'] = summary;

  return JSON.stringify(obj, null);
}

exports.serializeLangpackDiff = serializeLangpackDiff;
