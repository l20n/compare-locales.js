'use strict';

var Promise = require('promise');
var deepEqual = require('deep-equal');

var diff = require('./index');
var formatUtils = require('../../format/utils');

function Comparer(emitter) {
  this.emitter = emitter;
}

Comparer.prototype.compareLangpacks = function(lp1, lp2) {
  function createLangpackDiff(parsedDiffs) {
    return new diff.LangpackDiff(lp2.code, parsedDiffs);
  }

  function compareLangpacksResources(resources1, resources2) {
    var listDiff = diff.listDiff(
      Object.keys(resources1),
      Object.keys(resources2));
    /*jshint validthis:true */
    return Promise.all(
      listDiff.map(this.compareElement.bind(this, resources1, resources2)));
  }

  return Promise.all([lp1.resources, lp2.resources]).then(
    Function.prototype.apply.bind(compareLangpacksResources, this)).then(
      createLangpackDiff);
};

Comparer.prototype.compareElement = function(resources1, resources2, elem) {
  var resID = elem[0];

  switch(elem[1]) {
    case 'list1':
      return ['missing', resID];
    case 'list2':
      return ['obsolete', resID];
    case 'both':
      return this.compareResources(
        resources1[resID], resources2[resID]).then(function(resDiff) {
          return ['present', resID, resDiff];
        });
  }
};

Comparer.prototype.compareResources = function(res1, res2) {
  return Promise.all(
    [res1.path, res2.path].map(formatUtils.getResource)).then(
      Function.prototype.apply.bind(this.compareStructs, this));
};

Comparer.prototype.compareStructs = function(struct1, struct2) {
  var resDiff = new diff.ResourceDiff();
  var listDiff = diff.listDiff(
    Object.keys(struct1),
    Object.keys(struct2));

  listDiff.forEach(function(elem) {
    var entryId = elem[0];
    switch(elem[1]) {
      case 'list1':
        resDiff.entries.push(['missing', entryId]);
        break;
      case 'list2':
        resDiff.entries.push(['obsolete', entryId]);
        break;
      case 'both':
        var entryDiff =
          this.compareEntries(struct1[entryId], struct2[entryId], entryId);
        resDiff.entries.push(['present', entryId, entryDiff]);
        break;
    }
  }.bind(this));
  return resDiff;
};

Comparer.prototype.compareEntries = function(entry1, entry2, entryId) {
  var entryDiff = new diff.EntryDiff(entryId);

  this.emitter.emit('compare-entries', {
    entry1: entry1,
    entry2: entry2,
    callback: function(warnings) {
      warnings.forEach(function(warning) {
        entryDiff.warnings.push(warning);
      });
    }
  });

  if (entry1.value !== null && entry2.value !== null) {
    if (deepEqual(entry1.value, entry2.value) &&
        deepEqual(entry1.index, entry2.index)) {
      entryDiff.elements.push(['unchanged', 'value']);
    } else {
      entryDiff.elements.push(['changed', 'value']);
    }
  } else if (entry1.value === null && entry2.value !== null) {
    entryDiff.elements.push(['obsolete', 'value']);
  } else if (entry2.value === null && entry1.value !== null) {
    entryDiff.elements.push(['missing', 'value']);
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
          entryDiff.elements.push(['missing', 'attribute', name]);
          break;
        case 'list2':
          entryDiff.elements.push(['obsolete', 'attribute', name]);
          break;
        case 'both':
          if (deepEqual(entry1.attrs[name], entry2.attrs[name])) {
            entryDiff.elements.push(['unchanged', 'attribute', name]);
          } else {
            entryDiff.elements.push(['changed', 'attribute', name]);
          }
          break;
      }
    });
  }

  return entryDiff;
};

exports.Comparer = Comparer;
