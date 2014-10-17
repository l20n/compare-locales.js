'use strict';

var deepEqual = require('deep-equal');

var LangpackDiff = require('./core.js').LangpackDiff;
var ResourceDiff = require('./core.js').ResourceDiff;
var EntryDiff = require('./core.js').EntryDiff;

var utils = require('../utils.js');
var formatUtils = require('../../format/utils.js');

function compareLangpacks(lp1, lp2) {
  var diff = new LangpackDiff(lp2.code);

  var listDiff = utils.listDiff(Object.keys(lp1.resources),
                                Object.keys(lp2.resources));

  listDiff.forEach(function(elem) {
    var resID = elem[0];

    switch(elem[1]) {
      case 'list1':
        diff.entries.push(['missing', resID]);
        break;
      case 'list2':
        diff.entries.push(['obsolete', resID]);
        break;
      case 'both':
        var resDiff =
          compareResources(lp1.resources[resID], lp2.resources[resID]);
        diff.entries.push(['present', resID, resDiff]);
        break;
    }
  });
  return diff;
}

function compareResources(res1, res2) {
  var resDiff = new ResourceDiff();

  var res1Struct = formatUtils.getResource(res1.path);
  var res2Struct = formatUtils.getResource(res2.path);

  var listDiff = utils.listDiff(Object.keys(res1Struct),
                                Object.keys(res2Struct));

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
          compareEntries(res1Struct[entryId], res2Struct[entryId], entryId);
        resDiff.entries.push(['present', entryId, entryDiff]);
        break;
    }
  });
  return resDiff;
}

function compareEntries(entry1, entry2, entryId) {
  var entryDiff = new EntryDiff(entryId);

  if (typeof(entry1) !== typeof(entry2)) {
    if (typeof(entry1) === 'string') {
      entry1 = {'_': entry1};
    }
    if (typeof(entry2) === 'string') {
      entry2 = {'_': entry2};
    }
  }

  if (typeof(entry1) === 'string') {
    if (entry1 !== entry2) {
      entryDiff.elements.push(['changed', 'value']);
    } else {
      entryDiff.elements.push(['unchanged', 'value']);
    }
  } else {
    var listDiff = utils.listDiff(Object.keys(entry1), Object.keys(entry2));

    listDiff.forEach(function(elem) {
      var key = elem[0];

      if (key === '_index') {
        return;
      }

      var type = key === '_' ? 'value': 'attribute';
      var name = type === 'value' ? undefined : key;
      switch (elem[1]) {
        case 'list1':
          entryDiff.elements.push(['missing', type, name]);
          break;
        case 'list2':
          entryDiff.elements.push(['obsolete', type, name]);
          break;
        case 'both':
          if (deepEqual(entry1[key], entry2[key])) {
            entryDiff.elements.push(['unchanged', type, name]);
          } else {
            entryDiff.elements.push(['changed', type, name]);
          }
          break;
      }
    });
  }

  return entryDiff;
}

exports.compareLangpacks = compareLangpacks;

