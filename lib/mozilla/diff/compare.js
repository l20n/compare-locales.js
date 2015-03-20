'use strict';

var Promise = require('promise');
var deepEqual = require('deep-equal');
var EventEmitter = require('events').EventEmitter;

var diff = require('./index');
var formatUtils = require('../../format/utils');

function Comparer(config, app) {
  this.config = config;
  this.emitter = new EventEmitter();
  app.hooks.forEach(
    Function.prototype.apply.bind(this.emitter.on, this.emitter));
}

function createLangpackDiff(code, parsedDiffs) {
  return new diff.LangpackDiff(code, parsedDiffs);
}

function createResourceDiff(parsedDiff) {
  return new diff.ResourceDiff(parsedDiff);
}

Comparer.prototype.compareLangpacks = function(lp1, lp2) {
  return Promise.all([lp1.getResourcesPaths(), lp2.getResourcesPaths()]).then(
    Function.prototype.apply.bind(compareResLists, this)).then(
      createLangpackDiff.bind(null, lp2.code));
};

function compareResLists(resList1, resList2) {
  /* jshint validthis:true */
  var listDiff = diff.listDiff(
    Object.keys(resList1),
    Object.keys(resList2));
  return Promise.all(
    listDiff.map(parseResListDiffElem.bind(this, resList1, resList2)));
}

function parseResListDiffElem(reslist1, reslist2, elem) {
  /* jshint validthis:true */
  var resId = elem[0];

  switch(elem[1]) {
    case 'list1':
      return ['builtin', 'missing', resId];
    case 'list2':
      return ['builtin', 'obsolete', resId];
    case 'both':
      return this.compareResources(
        reslist1[resId], reslist2[resId]).then(function(resDiff) {
          return ['builtin', 'present', resId, resDiff];
        });
  }
}

Comparer.prototype.compareResources = function(res1, res2) {
  return Promise.all(
    [res1.path, res2.path].map(
      formatUtils.getResource.bind(formatUtils, this.config.type))).then(
      Function.prototype.apply.bind(compareEntryLists, this)).then(
        createResourceDiff);
};

function compareEntryLists(entrylist1, entrylist2) {
  /* jshint validthis:true */
  var listDiff = diff.listDiff(
    Object.keys(entrylist1),
    Object.keys(entrylist2));
  return Promise.all(
    listDiff.map(parseEntryListDiffElem.bind(this, entrylist1, entrylist2)));
}

function parseEntryListDiffElem(entrylist1, entrylist2, elem) {
  /* jshint validthis:true */
  var entryId = elem[0];
  switch(elem[1]) {
    case 'list1':
      return ['builtin', 'missing', entryId];
    case 'list2':
      return ['builtin', 'obsolete', entryId];
    case 'both':
      return this.compareEntries(
        entrylist1[entryId], entrylist2[entryId], entryId).then(
          function(entryDiff) {
            return ['builtin', 'present', entryId, entryDiff];
          });
  }
}

Comparer.prototype.compareEntries = function(entry1, entry2, entryId) {
  var entryDiff = new diff.EntryDiff(entryId);

  var severity = this.config.checkMore;
  var messages = [];

  this.emitter.emit('compare-entries', {
    severity: severity,
    entry1: entry1,
    entry2: entry2,
    callback: function(hooksMessages) {
      hooksMessages.forEach(function(msg) {
        if (msg[1] >= severity) {
          messages.push(msg);
        }
      });
    }
  });

  if (entry1.value !== null && entry2.value !== null) {
    if (deepEqual(entry1.value, entry2.value) &&
        deepEqual(entry1.index, entry2.index)) {
      entryDiff.elements.push(['builtin', 'unchanged', 'value']);
    } else {
      if (isResolvable(entry1) !== isResolvable(entry2)) {
        entryDiff.elements.push(['builtin', 'missing', 'value']);
      } else {
        entryDiff.elements.push(['builtin', 'changed', 'value']);
      }
    }
  } else if (entry1.value === null && entry2.value !== null) {
    entryDiff.elements.push(['builtin', 'obsolete', 'value']);
  } else if (entry2.value === null && entry1.value !== null) {
    entryDiff.elements.push(['builtin', 'missing', 'value']);
  }


  if (entry1.attrs !== null || entry2.value !== null) {
    if (entry1.attrs === null) {
      entry1.attrs = {};
    }
    if (entry2.attrs === null) {
      entry2.attrs = {};
    }

    var listDiff = diff.listDiff(
      Object.keys(entry1.attrs),
      Object.keys(entry2.attrs));

    listDiff.forEach(function(elem) {
      var name = elem[0];

      switch (elem[1]) {
        case 'list1':
          entryDiff.elements.push(
            ['builtin', 'missing', 'attribute', name]);
          break;
        case 'list2':
          entryDiff.elements.push(
            ['builtin', 'obsolete', 'attribute', name]);
          break;
        case 'both':
          if (deepEqual(entry1.attrs[name], entry2.attrs[name])) {
            entryDiff.elements.push(
              ['builtin', 'unchanged', 'attribute', name]);
          } else {
            entryDiff.elements.push(
              ['builtin', 'changed', 'attribute', name]);
          }
          break;
      }
    });
  }

  return Promise.all(messages).then(function(resolvedMessages) {
    entryDiff.messages = resolvedMessages.filter(isNotNull);
    return entryDiff;
  });
};

function isNotNull(elem) {
  return elem !== null;
}

function isResolvable(field) {
  return typeof(field.value) === 'string' ||
         Array.isArray(field.value) ||
         field.index !== null;
}

exports.Comparer = Comparer;
