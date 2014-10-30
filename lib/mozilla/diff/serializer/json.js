'use strict';

var util = require('util');

function serializeLangpackDiff(lpDiff) {
  return util.inspect(lpDiff, {showHidden: false, depth: null});
}

exports.serializeLangpackDiff = serializeLangpackDiff;
