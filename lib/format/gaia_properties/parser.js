'use strict';

var L10nError = require('../errors').L10nError;

var unescape = require('querystring').unescape;

var MAX_PLACEABLES = 100;


var PropertiesParser = {
  patterns: null,

  init: function() {
    this.patterns = {
      comment: /^\s*\#.*$/,
      entity: /^([^=\s]+)\s*=\s*(.*)$/,
      multiline: /[^\\]\\$/,
    };
  },

  parse: function(source) {
    var pos = -1;

    if (!this.patterns) {
      this.init();
    }

    var ast = [];
    var junk = null;

    var lines = source.split(/\n|\r/);
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      pos += line.length + 1;

      if (line.trim().length === 0) {
        continue;
      }

      if (this.patterns.comment.test(line)) {
        continue;
      }

      while (this.patterns.multiline.test(line) && i < lines.length) {
        line = line.slice(0, -1) + lines[++i].trim();
      }

      var entityMatch = line.match(this.patterns.entity);
      if (entityMatch) {
        if (junk !== null) {
          ast.push({$t: 'junk', $c: source.slice(junk.start, junk.end), $p: [junk.start, junk.end]});
          junk = null
        }
        ast.push({$i: entityMatch[1], $v: entityMatch[2].trim()});
        continue;
      }

      if (junk === null) {
        junk = {start: pos - line.length, end: pos + 1};
      } else {
        junk.end = pos + 1;
      }
    }
    return ast;
  },
};

module.exports = PropertiesParser;
