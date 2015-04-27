'use strict';

var L10nError = require('../errors').L10nError;

var MAX_PLACEABLES = 100;

var L20nParser = {
  _source: null,
  _index: null,
  _length: null,

  _patterns: {
    complexId: /[A-Za-z_][\w\.]*/g,
    identifier: /[A-Za-z_]\w*/g
  },

  parse: function (string) {
    this._source = string;
    this._index = 0;
    this._length = this._source.length;

    return this.getL20n();
  },

  getL20n: function() {
    var ast = [];

    this.getWS();
    while (this._index < this._length) {
      var e = this.getEntry();
      ast.push(e);

      if (this._index < this._length) {
        this.getWS();
      }
    }

    return ast;
  },

  getEntry: function() {
    // 60 === '<'
    if (this._source.charCodeAt(this._index) === 60) {
      ++this._index;
      var id = this.getIdentifier();
      // 91 == '['
      if (this._source.charCodeAt(this._index) === 91) {
        ++this._index;
        return this.getEntity(id,
          this.getItemList(this.getExpression.bind(this), ']'));
      }
      return this.getEntity(id, null);
    }
    throw this.error('Invalid entry');
  },

  getEntity: function(id, index) {
    var entity = Object.create(null);
    entity.$i = id;

    if (index) {
      entity.$x = index;
    }

    if (!this.getRequiredWS()) {
      throw this.error('Expected white space');
    }

    var ch = this._source.charAt(this._index);
    var value = this.getValue(index === null, ch);
    var attrs = null;
    if (value === null) {
      if (ch === '>') {
        throw this.error('Expected ">"');
      }
      attrs = this.getAttributes();
    } else {
      entity.$v = value;
      var ws1 = this.getRequiredWS();
      if (this._source.charAt(this._index) !== '>') {
        if (!ws1) {
          throw this.error('Expected ">"');
        }
        attrs = this.getAttributes();
      }
    }

    // skip '>'
    ++this._index;

    if (attrs) {
      /* jshint -W089 */
      for (var key in attrs) {
        entity[key] = attrs[key];
      }
    }

    return entity;
  },

  getValue: function(optional, ch, index) {
    var val;
    var overlay = false;

    if (ch === undefined) {
      ch = this._source.charAt(this._index);
    }
    if (ch === '\'' || ch === '"') {
      val = this.getString(ch, 1);
      overlay = val[1];
      val = val[0];
    } else if (ch === '{') {
      val = this.getHash();
    }

    if (val === undefined) {
      if (!optional) {
        throw this.error('Unknown value type');
      }
      return null;
    }

    if (index || overlay) {
      var value = Object.create(null);
      value.v = val;

      if (index) {
        value.x = index;
      }
      if (overlay) {
        value.t = 'overlay';
      }
      return value;
    }

    return val;
  },

  getWS: function() {
    var cc = this._source.charCodeAt(this._index);
    // space, \n, \t, \r
    while (cc === 32 || cc === 10 || cc === 9 || cc === 13) {
      cc = this._source.charCodeAt(++this._index);
    }
  },

  getRequiredWS: function() {
    var pos = this._index;
    var cc = this._source.charCodeAt(pos);
    // space, \n, \t, \r
    while (cc === 32 || cc === 10 || cc === 9 || cc === 13) {
      cc = this._source.charCodeAt(++this._index);
    }
    return this._index !== pos;
  },

  getIdentifier: function() {
    var reId = this._patterns.identifier;

    reId.lastIndex = this._index;

    var match = reId.exec(this._source);

    if (!match ||
        reId.lastIndex - this._index !== match[0].length) {
      throw this.error('Identifier has to start with [a-zA-Z_]');
    }

    this._index = reId.lastIndex;

    return match[0];
  },

  getComplexId: function() {
    var reId = this._patterns.complexId;
    reId.lastIndex = this._index;
    var match = reId.exec(this._source);

    if (!match ||
        reId.lastIndex - this._index !== match[0].length) {
      throw this.error('Identifier has to start with [a-zA-Z_]');
    }

    this._index = reId.lastIndex;
    return match[0];
  },

  getString: function(opchar, opcharLen) {
    var opcharPos = this._source.indexOf(opchar, this._index + opcharLen);

    if (opcharPos === -1) {
      throw this.error('Unclosed string literal');
    }
    var buf = this._source.slice(this._index + opcharLen, opcharPos);

    var testPos = buf.indexOf('{{');
    if (testPos !== -1) {
      return this.getComplexString(opchar, opcharLen);
    }
    
    testPos = buf.indexOf('\\');
    if (testPos !== -1) {
      return this.getComplexString(opchar, opcharLen);
    }

    this._index = opcharPos + opcharLen;

    return [buf, this.isOverlay(buf)];
  },


  getAttributes: function() {
    var attrs = Object.create(null);
    var attr, ws1, ch;

    while (true) {
      attr = this.getKVPWithIndex();
      attrs[attr[0]] = attr[1];
      ws1 = this.getRequiredWS();
      ch = this._source.charAt(this._index);
      if (ch === '>') {
        break;
      } else if (!ws1) {
        throw this.error('Expected ">"');
      }
    }
    return attrs;
  },

  getKVP: function() {
    var key = this.getIdentifier();
    this.getWS();
    if (this._source.charAt(this._index) !== ':') {
      throw this.error('Expected ":"');
    }
    ++this._index;
    this.getWS();
    return [key, this.getValue()];
  },

  getKVPWithIndex: function() {
    var key = this.getIdentifier();
    var index = null;

    if (this._source.charAt(this._index) === '[') {
      ++this._index;
      this.getWS();
      index = this.getItemList(this.getExpression.bind(this), ']');
    }
    this.getWS();
    if (this._source.charAt(this._index) !== ':') {
      throw this.error('Expected ":"');
    }
    ++this._index;
    this.getWS();
    return [
      key,
      this.getValue(false, undefined, index)
    ];
  },

  getHash: function() {
    ++this._index;
    this.getWS();
    var defItem, hi, comma, hash = Object.create(null);

    while (true) {
      var isDefItem = false;
      if (this._source.charAt(this._index) === '*') {
        ++this._index;
        if (defItem !== undefined) {
          throw this.error('Default item redefinition forbidden');
        }
        isDefItem = true;
      }
      hi = this.getKVP();
      hash[hi[0]] = hi[1];
      if (isDefItem) {
        defItem = hi[0];
      }
      this.getWS();

      comma = this._source.charAt(this._index) === ',';
      if (comma) {
        ++this._index;
        this.getWS();
      }
      if (this._source.charAt(this._index) === '}') {
        ++this._index;
        break;
      }
      if (!comma) {
        throw this.error('Expected "}"');
      }
    }
    
    if (defItem !== undefined) {
      hash['__default'] = defItem;
    }
    return hash;
  },

  unescapeString: function() {
    var ch = this._source.charAt(++this._index);
    var cc;
    if (ch === 'u') { // special case for unicode
      var ucode = '';
      for (var i = 0; i < 4; i++) {
        ch = this._source[++this._index];
        cc = ch.charCodeAt(0);
        if ((cc > 96 && cc < 103) || // a-f
            (cc > 64 && cc < 71) || // A-F
            (cc > 47 && cc < 58)) { // 0-9
              ucode += ch;
            } else {
              throw this.error('Illegal unicode escape sequence');
            }
      }
      return String.fromCharCode(parseInt(ucode, 16));
    }
    return ch;
  },

  isOverlay: function(str) {
    var overlay = false;

    var testPos = str.indexOf('<');
    if (testPos !== -1 &&
        str.charAt(testPos + 1) !== ' ') {
      overlay = true;
    } else {
      testPos = str.indexOf('&');
      if (testPos !== -1 &&
          str.charAt(testPos + 1) !== ' ') {
        overlay = true;
      }
    }
    return overlay;
  },

  getComplexString: function(opchar, opcharLen) {
    var body = null;
    var buf = '';
    var placeables = 0;
    var overlay = false;
    var ch;

    this._index += opcharLen - 1;

    walkChars:
    while (true) {
      ch = this._source.charAt(++this._index);
      switch (ch) {
        case '\\':
          buf += this.unescapeString();
          break;
        case '{':
          /* We want to go to default unless {{ */
          /* jshint -W086 */
          if (this._source.charAt(this._index + 1) === '{') {
            if (body === null) {
              body = [];
            }
            if (placeables > MAX_PLACEABLES - 1) {
              throw this.error('Too many placeables, maximum allowed is ' +
                  MAX_PLACEABLES);
            }
            if (buf) {
              if (this.isOverlay(buf)) {
                overlay = true;
              }
              body.push(buf);
            }
            this._index += 2;
            this.getWS();
            body.push(this.getExpression());
            this.getWS();
            if (this._source.charAt(this._index) !== '}' ||
                this._source.charAt(this._index + 1) !== '}') {
                  throw this.error('Expected "}}"');
                }
            this._index += 1;
            placeables++;
            
            buf = '';
            break;
          }
        default:
          if (ch === opchar) {
            this._index++;
            break walkChars;
          }
          buf += ch;
          if (this._index + 1 >= this._length) {
            throw this.error('Unclosed string literal');
          }
      }
    }
    if (body === null) {
      return [buf, this.isOverlay(buf)];
    }
    if (buf.length) {
      if (this.isOverlay(buf)) {
        overlay = true;
      }
      body.push(buf);
    }
    return [body, overlay];
  },

  getExpression: function() {
    var exp = this.getPrimaryExpression();

    this.getWS();

    if (this._source.charAt(this._index) === '(') {
      this._index++;
      return this.getCallExpression(exp);
    }
    
    return exp;
  },

  getCallExpression: function(callee) {
    this.getWS();
    var exp = Object.create(null);

    exp.t = 'call';
    exp.v = callee;
    exp.a = this.getItemList(this.getExpression.bind(this), ')');

    return exp;
  },

  getPrimaryExpression: function() {
    var cc = this._source.charCodeAt(this._index);

    var prim = Object.create(null);

    switch (cc) {
      // variable: $
      case 36:
        ++this._index;
        prim.t = 'var';
        prim.v = this.getComplexId();
        break;
      // global: @
      case 64:
        ++this._index;
        prim.t = 'glob';
        prim.v = this.getComplexId();
        break;
      default:
        prim.t = 'id';
        prim.v = this.getIdentifier();
        break;
    }

    return prim;
  },

  getItemList: function(callback, closeChar) {
    var ch;
    this.getWS();
    if (this._source.charAt(this._index) === closeChar) {
      ++this._index;
      return [];
    }

    var items = [];

    while (true) {
      items.push(callback());
      this.getWS();
      ch = this._source.charAt(this._index);
      if (ch === ',') {
        ++this._index;
        this.getWS();
      } else if (ch === closeChar) {
        ++this._index;
        break;
      } else {
        throw this.error('Expected "," or "' + closeChar + '"');
      }
    }

    return items;
  },

  error: function(message, pos) {
    if (pos === undefined) {
      pos = this._index;
    }
    var start = this._source.lastIndexOf('<', pos - 1);
    var lastClose = this._source.lastIndexOf('>', pos - 1);
    start = lastClose > start ? lastClose + 1 : start;
    var context = '\x1b[90m' + this._source.slice(start, pos) + '\x1b[0m';
    context += this._source.slice(pos, pos + 10);

    var msg = message + ' at pos ' + pos + ': `' + context + '`';
    return new L10nError(msg);
  }
};

module.exports = L20nParser;
