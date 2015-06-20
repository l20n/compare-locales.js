'use strict';

var levels = require('../levels');
var calculateStatsForLangpackDiff =
  require('../stats').calculateStatsForLangpackDiff;
var serializerUtils = require('./utils');

function serializeFile(entry) {
  if (entry[1] === 'missing') {
    var value = { 'missingFile': 'error' };
    value.strings = entry[3].entries.length;
    return { value: value };
  } else if (entry[1] === 'obsolete') {
    return {
      value: {
        'obsoleteFile': 'error'
      }
    };
  } else if (entry[1] === 'error') {
    return {
      value: {
        'error': entry[3]
      }
    };
  } else {
    var missingEntries = [];
    var obsoleteEntries = [];
    var errors = [];
    var warnings = [];

    entry[3].errors.forEach(function(e) {
      errors.push(e);
    });

    entry[3].entries.sort(serializerUtils.sortEntries);
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
        value.warning = warnings;
      }
      if (errors.length) {
        value.error = errors;
      }
      return {
        value: value
      };
    } else {
      return null;
    }
  }
  var ret = {};
  return ret;
}

function serializeStruct(struct) {
  var ret = [];

  if (Array.isArray(struct)) {
    var sub = serializeFile(struct);
    if (sub) {
      ret.push([struct[2], sub]);
    }
    return ret;
  }

  var keys = Object.keys(struct).sort();
  for (var i in keys) {
    var key = keys[i];
    var val = struct[key];
    if (Array.isArray(val)) {
      var sub = serializeFile(val);
      if (sub) {
        ret.push([key, sub]);
      }
    } else {
      ret.push([key, {'children': serializeStruct(val)}]);
    }
  }

  return ret;
}

function serializeLangpackDiff(lpDiff) {
  var obj = {
    details: {},
    summary: {},
  };

  var stats = calculateStatsForLangpackDiff(lpDiff);

  lpDiff.entries.sort(serializerUtils.sortEntries);

  var structuredDiff = serializerUtils.createStructuredDiff(lpDiff.entries);

  var children = serializeStruct(structuredDiff);

  if (children.length) {
    obj.details.children = children;
  }

  var summary = {};

  if (stats.changed) {
    summary.changed = stats.changed;
  }
  if (stats.missing) {
    summary.missing = stats.missing;
  }
  if (stats.missingInFiles) {
    summary.missingInFiles = stats.missingInFiles;
  }
  if (stats.obsolete) {
    summary.obsolete = stats.obsolete;
  }
  if (stats.unchanged) {
    summary.unchanged = stats.unchanged;
  }
  if (stats.infos) {
    summary.infos = stats.infos;
  }
  if (stats.warnings) {
    summary.warnings = stats.warnings;
  }
  if (stats.errors) {
    summary.errors = stats.errors;
  }
  if (stats.critical) {
    summary.critical = stats.critical;
  }

  obj.summary['null'] = summary;

  return JSON.stringify(obj, null);
}

exports.serializeLangpackDiff = serializeLangpackDiff;
