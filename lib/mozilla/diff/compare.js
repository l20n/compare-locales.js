'use strict';

var Promise = require('promise');
var deepEqual = require('deep-equal');

var LangpackDiff = require('./core.js').LangpackDiff;
var ResourceDiff = require('./core.js').ResourceDiff;
var EntryDiff = require('./core.js').EntryDiff;

var utils = require('../utils.js');
var formatUtils = require('../../format/utils.js');

function compareLangpacks(lp1, lp2) {
  function createLangpackDiff(parsedDiffs) {
    return new LangpackDiff(lp2.code, parsedDiffs);
  }

  function compareLangpacksResources(resources1, resources2) {
    var listDiff = utils.listDiff(
      Object.keys(resources1),
      Object.keys(resources2));
    return Promise.all(
      listDiff.map(compareElement.bind(null, resources1, resources2)));
  }

  return Promise.all([lp1.resources, lp2.resources]).then(
    Function.prototype.apply.bind(compareLangpacksResources, null)).then(
      createLangpackDiff);
}

function compareElement(resources1, resources2, elem) {
  var resID = elem[0];

  switch(elem[1]) {
    case 'list1':
      return ['missing', resID];
    case 'list2':
      return ['obsolete', resID];
    case 'both':
      return compareResources(
        resources1[resID], resources2[resID]).then(function(resDiff) {
          return ['present', resID, resDiff];
        });
  }
}

function compareResources(res1, res2) {
  return Promise.all(
    [res1.path, res2.path].map(formatUtils.getResource)).then(
      Function.prototype.apply.bind(compareStructs, null));
}

function compareStructs(struct1, struct2) {
  var resDiff = new ResourceDiff();
  var listDiff = utils.listDiff(
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
          compareEntries(struct1[entryId], struct2[entryId], entryId);
        resDiff.entries.push(['present', entryId, entryDiff]);
        break;
    }
  });
  return resDiff;
}

function compareEntries(entry1, entry2, entryId) {
  var entryDiff = new EntryDiff(entryId);

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

    var listDiff = utils.listDiff(
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
}

exports.compareLangpacks = compareLangpacks;

