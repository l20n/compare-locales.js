'use strict';

var Promise = require('promise');

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
  var entryDiff = new EntryDiff();

  // this will work with properties struct only for now
  if (typeof(entry1) === 'string') {
    if (typeof(entry2) !== 'string') {
      entryDiff.elements.push(['different', 'value', entryId]);
    } else {
      if (entry1 !== entry2) {
        entryDiff.elements.push(['changed', 'value', entryId]);
      } else {
        entryDiff.elements.push(['unchanged', 'value', entryId]);
      }
    }
  } else {
    for (var key in entry1) {
      if (!(key in entry2)) {
        entryDiff.elements.push(['missing', 'attribute', key]);
      } else {
        if (entry1[key] === entry2[key]) {
          entryDiff.elements.push(['unchanged', 'attribute', key]);
        } else {
          entryDiff.elements.push(['changed', 'attribute', key]);
        }
      }
    }
  }

  return entryDiff;
}

exports.compareLangpacks = compareLangpacks;

