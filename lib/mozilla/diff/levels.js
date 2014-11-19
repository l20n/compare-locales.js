'use strict';

// https://docs.python.org/2/library/logging.html#levels

var LEVEL_LABELS = {
  20: 'INFO',
  30: 'WARNING',
  40: 'ERROR'
};

module.exports = {
  INFO: 20,
  WARNING: 30,
  ERROR: 40,
  getLabel: function(level) {
    return LEVEL_LABELS[level] || '{' + level + '}';
  }
};
