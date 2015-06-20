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
      entries: /[^\r\n]*/g,
      placeables: /\{\{\s*([^\s]*?)\s*\}\}/,
    };
  },

  parse: function(source) {
    var pos = 0;

    if (!this.patterns) {
      this.init();
    }

    var ast = [];

    var entries = source.match(this.patterns.entries);
    if (!entries) {
      return ast;
    }
    for (var i = 0; i < entries.length; i++) {
      var line = entries[i];

      if (line.length === 0) {
        pos += 1;
        continue;
      }

      if (this.patterns.comment.test(line)) {
        pos += line.length;
        continue;
      }

      while (this.patterns.multiline.test(line) && i < entries.length) {
        line = line.slice(0, -1) + entries[++i].trim();
      }

      var entityMatch = line.match(this.patterns.entity);
      if (entityMatch) {
        this.parseEntity(entityMatch[1], entityMatch[2], ast);
      } else {
        ast.push({$t: 'junk', $c: line + '\n', $p: [pos, pos + line.length + 1]});
      }
      pos += line.length;
    }
    return ast;
  },

  parseEntity: function(id, value, ast) {
    value = value.trim();
    // don't unescape. We want to keep it for warnings
    this.setEntityValue(id, value, ast);
  },

  setEntityValue: function(id, value, ast) {
    var pos, v;

    if (value.indexOf('{{') !== -1) {
      value = this.parseString(value);
    }

    // simple value
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
