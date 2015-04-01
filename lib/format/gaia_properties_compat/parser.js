'use strict';

var L10nError = require('../errors').L10nError;

var unescape = require('querystring').unescape;

var MAX_PLACEABLES = 100;


var PropertiesParser = {
  patterns: null,

  init: function() {
    this.patterns = {
      comment: /^\s*#|^\s*$/,
      entity: /^([^=\s]+)\s*=\s*(.*)$/,
      multiline: /[^\\]\\$/,
      unicode: /\\u([0-9a-fA-F]{1,4})/g,
      entries: /[^\r\n]+/g,
      controlChars: /\\([\\\n\r\t\b\f\{\}\"\'])/g,
      placeables: /\{\{\s*([^\s]*?)\s*\}\}/,
    };
  },

  parse: function(source) {
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

      if (this.patterns.comment.test(line)) {
        continue;
      }

      while (this.patterns.multiline.test(line) && i < entries.length) {
        line = line.slice(0, -1) + entries[++i].trim();
      }

      var entityMatch = line.match(this.patterns.entity);
      if (entityMatch) {
        this.parseEntity(entityMatch[1], entityMatch[2], ast);
      }
    }
    return ast;
  },

  parseEntity: function(id, value, ast) {
    value = value.trim();
    this.setEntityValue(id, this.unescapeString(value), ast);
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

  unescapeString: function(str) {
    if (str.lastIndexOf('\\') !== -1) {
      str = str.replace(this.patterns.controlChars, '$1');
    }
    return str.replace(this.patterns.unicode, function(match, token) {
      return unescape('%u' + '0000'.slice(token.length) + token);
    });
  },
};

module.exports = PropertiesParser;
