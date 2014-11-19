'use strict';

var Promise = require('promise');

var levels = require('../../diff/levels');

function checkWord(lang, word) {
  return new Promise(function(resolve) {
    // XXX check spelling asynchronously
    setTimeout(function() {
      switch(word) {
        case 'réglee':
          return resolve([word, ['réglé', 'réglée', 'réglés']]);
        case 'por':
          return resolve([word, ['pour']]);
        default:
          resolve(null);
      }
    });
  });
}

var reWhitespace = /\s+/;

function isString(part) {
  return typeof part === 'string';
}

function getWords(val) {
  if (typeof val === 'string') {
    return val.split(reWhitespace);
  }

  return val.filter(isString).reduce(function(seq, elem) {
    return seq.concat(elem.split(reWhitespace));
  }, []);
}

function checkPhrase(lang, val) {
  if (!val.length) {
    return [];
  }

  return getWords(val).map(checkWord.bind(null, lang));
}

function createWarning(elem, name, suggestions) {
  if (!suggestions) {
    return null;
  }

  if (suggestions[1]) {
    var msg = suggestions[0] + ' is misspelled. Suggested spellings: ' +
      suggestions[1].join(', ');
    return ['spellcheck', levels.INFO, elem, name, msg];
  }

  return [
    'spellcheck', levels.INFO, elem, name, suggestions[0] + ' is misspelled'];
}

function main(translation, callback) {
  var result = [];

  var pushResult = function(elem, name, promise) {
    result.push(promise.then(createWarning.bind(null, elem, name)));
  };

  if (translation.value) {
    // XXX how to get translation.lang?
    checkPhrase(translation.lang, translation.value).forEach(
      pushResult.bind(null, 'value', null));
  }

  callback(result);
}

module.exports = function(evt) {
  main(evt.entry2, evt.callback);
};
