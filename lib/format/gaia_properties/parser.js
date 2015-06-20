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
        this.parseEntity(entityMatch[1], entityMatch[2], ast);
        continue;
      }

      ast.push({$t: 'junk', $c: line + '\n', $p: [pos - line.length, pos + 1]});
    }
    return ast;
  },

  parseEntity: function(id, value, ast) {
    value = value.trim();
    // don't unescape. We want to keep it for warnings
    this.setEntityValue(id, value, ast);
  },

  setEntityValue: function(id, value, ast) {
    // simple value
    ast.push({$i: id, $v: value});
  },
};

module.exports = PropertiesParser;
