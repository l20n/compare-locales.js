'use strict';

var calculateStatsForLangpackDiff =
  require('../stats').calculateStatsForLangpackDiff;

function serializeLangpackDiff(lpDiff) {
  var output = {
    items: [],
    properties: {},
    types: {
      Build: { pluralLabel: 'Builds' }
    }
  };

  var stats = calculateStatsForLangpackDiff(lpDiff);

  var goodEntries = stats.unchanged + stats.changed + stats.missing + stats.missingInFiles;
  var changePerc = parseInt(stats.changed / goodEntries * 100);

  var locale = 'xxx';

  var result;

  if (stats.missing || stats.missingInFiles) {
    result = 'failure';
  } else {
    result = 'success';
  }

  output.items.push({
    "completion": changePerc,
    "missing": stats.missing,
    "locale": locale,
    "unchanged": stats.unchanged,
    "changed": stats.changed,
    "label": locale,
    "result": result,
    "total": stats.entries,
    "type": "Build",
    "id": locale
  });

  ['completion', 'errors', 'warnings', 'missing', 'report', 'unchanged',
    'changed', 'obsolete'].forEach(function(p) {
    output.properties[p] = {
      valueType: 'number'
    };
  });
  output.properties

  return JSON.stringify(output, null, 2);
}

exports.serializeLangpackDiff = serializeLangpackDiff;
