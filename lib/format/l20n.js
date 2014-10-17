'use strict';

var unescape = require('querystring').unescape;

function L20nParser() {
  var _source;
  var _index;
  var _length;

  var patterns = {
    identifier: /[A-Za-z_]\w*/g,
    unicode: /\\u([0-9a-fA-F]{1,4})/g,
    controlChars: /\\([\\\n\r\t\b\f\{\}\"\'])/g
  };

  this.parse = function (string) {
    _source = string;
    _index = 0;
    _length = _source.length;

    return getL20n();
  };

  function getAttributes() {
    var attrs = Object.create(null);
    var attr, ws1, ch;

    while (true) {
      attr = getKVPWithIndex();
      attrs[attr[0]] = attr[1];
      ws1 = getRequiredWS();
      ch = _source.charAt(_index);
      if (ch === '>') {
        break;
      } else if (!ws1) {
        throw error('Expected ">"');
      }
    }
    return attrs;
  }

  function getKVP() {
    var key = getIdentifier();
    getWS();
    if (_source.charAt(_index) !== ':') {
      throw error('Expected ":"');
    }
    ++_index;
    getWS();
    return [key, getValue()];
  }

  function getKVPWithIndex() {
    var key = getIdentifier();
    var index = null;

    if (_source.charAt(_index) === '[') {
      ++_index;
      getWS();
      index = getIndex();
    }
    getWS();
    if (_source.charAt(_index) !== ':') {
      throw error('Expected ":"');
    }
    ++_index;
    getWS();
    return [
      key,
      getValue(false, undefined, index)
    ];
  }

  function getHash() {
    ++_index;
    getWS();
    var hi, comma, hash = Object.create(null);
    while (true) {
      hi = getKVP();
      hash[hi[0]] = hi[1];
      getWS();

      comma = _source.charAt(_index) === ',';
      if (comma) {
        ++_index;
        getWS();
      }
      if (_source.charAt(_index) === '}') {
        ++_index;
        break;
      }
      if (!comma) {
        throw error('Expected "}"');
      }
    }
    return hash;
  }

  function unescapeString(str) {
    str = str.replace(patterns.controlChars, '$1');
    return str.replace(patterns.unicode, function(match, token) {
      return unescape('%u' + '0000'.slice(token.length) + token);
    });
  }

  function getString(opchar) {
    var unesc = false;

    var opcharPos = _source.indexOf(opchar, _index + 1);

    while (opcharPos !== -1 &&
           _source.charCodeAt(opcharPos - 1) === 92 &&
           _source.charCodeAt(opcharPos - 2) !== 92) {
      opcharPos = _source.indexOf(opchar, opcharPos + 1);
      unesc = true;
    }
    
    if (opcharPos === -1) {
      throw error('Unclosed string literal');
    }

    var buf = _source.slice(_index + 1, opcharPos);

    _index = opcharPos + 1;

    if (unesc) {
      return unescapeString(buf);
    }
    return buf;
  }

  function getValue(optional, ch, index) {
    var val;

    if (ch === undefined) {
      ch = _source.charAt(_index);
    }
    if (ch === '\'' || ch === '"') {
      val = getString(ch);
    } else if (ch === '{') {
      val = {
        '_': getHash()
      };
    }

    if (!val) {
      if (!optional) {
        throw error('Unknown value type');
      }
      return null;
    }

    if (!index) {
      return val;
    }

    if (typeof val === 'string') {
      val = {
        '_': val
      };
    }
    val._index = index;

    return val;
  }

  function getRequiredWS() {
    var pos = _index;
    var cc = _source.charCodeAt(pos);
    // space, \n, \t, \r
    while (cc === 32 || cc === 10 || cc === 9 || cc === 13) {
      cc = _source.charCodeAt(++_index);
    }
    return _index !== pos;
  }

  function getWS() {
    var cc = _source.charCodeAt(_index);
    // space, \n, \t, \r
    while (cc === 32 || cc === 10 || cc === 9 || cc === 13) {
      cc = _source.charCodeAt(++_index);
    }
  }


  function getIdentifier() {
    var reId = patterns.identifier;

    reId.lastIndex = _index;

    var match = reId.exec(_source);

    _index = reId.lastIndex;

    return match[0];
  }

  function getEntity(id, index) {
    if (!getRequiredWS()) {
      throw error('Expected white space');
    }

    var ch = _source.charAt(_index);
    var value = getValue(index === null, ch, index);
    var attrs = null;
    if (value === null) {
      if (ch === '>') {
        throw error('Expected ">"');
      }
      attrs = getAttributes();
    } else {
      var ws1 = getRequiredWS();
      if (_source.charAt(_index) !== '>') {
        if (!ws1) {
          throw error('Expected ">"');
        }
        attrs = getAttributes();
      }
    }

    // skip '>'
    ++_index;

    if (attrs) {
      if (typeof value === 'string') {
        value = {
          '_': value
        };
      } else if (value === null) {
        value = {
        };
      }
      /* jshint -W089 */
      for (var key in attrs) {
        value[key] = attrs[key];
      }
    }

    return [id, value];
  }

  function getEntry() {

    // 60 === '<'
    if (_source.charCodeAt(_index) === 60) {
      ++_index;
      var id = getIdentifier();
      // 91 == '['
      if (_source.charCodeAt(_index) === 91) {
        ++_index;
        return getEntity(id,
                         getIndex());
      }
      return getEntity(id, null);
    }
    throw error('Invalid entry');
  }

  function getL20n() {
    var entries = Object.create(null);

    getWS();
    while (_index < _length) {
      var e = getEntry();
      entries[e[0]] = e[1];

      if (_index < _length) {
        getWS();
      }
    }

    return entries;
  }


  var indexPattern = /@cldr\.plural\((\w+)\)/g;

  function getIndex() {
    getWS();

    indexPattern.lastIndex = _index;

    var match = indexPattern.exec(_source);

    _index = indexPattern.lastIndex;

    getWS();

    _index++;

    return ['plural', match[1]];
  }

  function error(message, pos) {
    if (pos === undefined) {
      pos = _index;
    }
    var start = _source.lastIndexOf('<', pos - 1);
    var lastClose = _source.lastIndexOf('>', pos - 1);
    start = lastClose > start ? lastClose + 1 : start;
    var context = _source.slice(start, pos + 10);

    var msg = message + ' at pos ' + pos + ': "' + context + '"';
    return new Error(msg, pos, context);
  }
}

exports.L20nParser = L20nParser;

