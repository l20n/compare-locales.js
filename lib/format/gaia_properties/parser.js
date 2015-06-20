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
      placeables: /\{\{\s*([^\s]*?)\s*\}\}/,
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
        this.setEntityValue(entityMatch[1], entityMatch[2].trim(), ast);
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

  setEntityValue: function(id, value, ast) {
    if (value.indexOf('{{') !== -1) {
      value = this.parseString(value);
    }

    ast.push({$i: id, $v: value});
  },

  parseString: function(str) {
    var chunks = str.split(this.patterns.placeables);
    var complexStr = [];

    var len = chunks.length;
    var placeablesCount = (len - 1) / 2;

    if (placeablesCount >= MAX_PLACEABLES) {
      throw new L10nError('Too many placeables (' + placeablesCount +
                          ', max allowed is ' + MAX_PLACEABLES + ')');
    }

    for (var i = 0; i < chunks.length; i++) {
      if (chunks[i].length === 0) {
        continue;
      }
      if (i % 2 === 1) {
        complexStr.push({t: 'idOrVar', v: chunks[i]});
      } else {
        complexStr.push(chunks[i]);
      }
    }
    return complexStr;
  },
};

module.exports = PropertiesParser;
