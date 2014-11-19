'use strict';

// Modeled after https://docs.python.org/2/library/logging.html#levels
var LEVELS = {
  20: 'INFO',
  30: 'WARNING',
  40: 'ERROR',
  50: 'CRITICAL'
};

// Invert LEVELS and expose each level on exports
Object.keys(LEVELS).reduce(function(seq, cur) {
  seq[LEVELS[cur]] = cur;
  return seq;
}, exports);

exports.getLabel = function(level) {
  return LEVELS[level] || '{' + level + '}';
};

exports.getLower = function(level) {
  if (level <= exports.INFO) {
    return exports.INFO;
  }

  while (!LEVELS[--level]) {
    continue;
  }
  return level++;
};
