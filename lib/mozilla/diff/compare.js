'use strict';

var EventEmitter = require('events').EventEmitter;

var levels = require('./levels');
var diff = require('./index');
var formatUtils = require('../../format/utils');
var utils = require('../utils');

function Comparer(config, App) {
  this.config = config;
  this.emitter = new EventEmitter();

  var hooks = [];
  if (config.runTests) {
    hooks = config.runTests.split(',').map(function(test) {
      return test.trim();
    });
  }

  for (var name in App.hooks) {
    if (hooks.indexOf(name) !== -1) {
      this.emitter.on.apply(this.emitter, App.getHook(name));
    }
  }
}

function createLangpackDiff(code, parsedDiffs) {
  return new diff.LangpackDiff(code, parsedDiffs);
}

function createResourceDiff(ret) {
  return new diff.ResourceDiff(ret[0], ret[1]);
}

Comparer.prototype.compareLangpacks = function(lp1, lp2) {
  return Promise.all([lp1.resources, lp2.resources]).then(
    Function.prototype.apply.bind(compareResLists, this)).then(
      createLangpackDiff.bind(null, lp2.code));
};

function compareResLists(resList1, resList2) {
  var listDiff = diff.listDiff(
    Object.keys(resList1),
    Object.keys(resList2));
  return Promise.all(
    listDiff.map(parseResListDiffElem.bind(this, resList1, resList2)));
}

function parseResListDiffElem(reslist1, reslist2, elem) {
  var resId = elem[0];

  switch(elem[1]) {
    case 'list1':
      return this.getMissingResource(
        reslist1[resId]).then(function(resDiff) {
          return ['builtin', 'missing', resId, resDiff];
        });
    case 'list2':
      return ['builtin', 'obsolete', resId];
    case 'both':
      return this.compareResources(
        reslist1[resId], reslist2[resId]).then(function(resDiff) {
          return ['builtin', 'present', resId, resDiff];
        }).catch(function(err) {
          return ['builtin', 'error', resId, [err]];
        });
  }
}

Comparer.prototype.getMissingResource = function(res1) {
  return formatUtils.getResource(this.config.type, res1.path).then(function(entries) {
    var diffRes = [];
    for (var id in entries[1]) {
      diffRes.push(['builtin', 'missing', id ]);
    }
    return [[], diffRes];
  }).then(createResourceDiff);
};

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
    Object.keys(entrylist1[1]),
    Object.keys(entrylist2[1]));
  return Promise.all(listDiff.map(
    parseEntryListDiffElem.bind(this, entrylist1[1], entrylist2[1]))).then(
    function(diff) {
      var errors = [];
      if (entrylist1[0]) {
        errors = errors.concat(entrylist1[0]);
      }
      if (entrylist2[0]) {
        errors = errors.concat(entrylist2[0]);
      }
      return [errors, diff];
  });
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

  var severity = levels.WARNING;
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

  var valueDiff = compareValues(entry1, entry2);
  if (valueDiff) {
    entryDiff.elements.push(valueDiff);
  }

  if (entry1.attrs !== null || entry2.attrs !== null) {
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
          if (utils.equals(entry1.attrs[name], entry2.attrs[name])) {
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

function compareValues(field1, field2) {
  if (field1.value === null && field2.value === null) {
    return;
  }

  if (field1.value !== null && field2.value !== null) {
    if (utils.equals(field1.value, field2.value) &&
        utils.equals(field1.index, field2.index)) {
      return ['builtin', 'unchanged', 'value'];
    } else {
      return ['builtin', 'changed', 'value'];
    }
  } else if (field1.value === null && field2.value !== null) {
    return ['builtin', 'obsolete', 'value'];
  } else if (field2.value === null && field1.value !== null) {
    return ['builtin', 'missing', 'value'];
  }
}

function isNotNull(elem) {
  return elem !== null;
}

exports.Comparer = Comparer;
