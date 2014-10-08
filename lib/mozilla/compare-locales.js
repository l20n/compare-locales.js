'use strict';

var path = require('path');
var Promise = require('promise');

var LangpackDiff = require('./diff.js').LangpackDiff;
var ResourceDiff = require('./diff.js').ResourceDiff;
var EntryDiff = require('./diff.js').EntryDiff;
var PropertiesParser = require('../format/properties.js').PropertiesParser;
var L20nParser = require('../format/l20n.js').L20nParser;
var utils = require('./utils.js');

var parsers = {};

function getResource(resPath) {
  var type = resPath.substring(resPath.lastIndexOf('.') + 1);

  switch (type) {
    case 'l20n':
      if (!('l20n' in parsers)) {
        parsers['l20n'] = new L20nParser();
      }
      break;
    case 'properties':
      if (!('properties' in parsers)) {
        parsers['properties'] = new PropertiesParser();
      }
      break;
  }
  var resSource = utils.getFileContent(resPath);
  try {
  var resStruct = parsers[type].parse(resSource);
  } catch(e){console.log(e);}
  return resStruct;
}

function compareLangpacks(lp1, lp2) {
  return new Promise(function (resolve, reject) {
    var diff = new LangpackDiff(lp2.code);

    for (var resID in lp1.resources) {
      if (!(resID in lp2.resources)) {
        diff.entries.push(['missing', resID]);
        continue;
      }

      var it = Object.keys(lp1.resources).length;

      compareResources(lp1.resources[resID],
                       lp2.resources[resID]).then(function(resDiff) {
        diff.entries.push(['present', resID, resDiff]);

        if (--it === 0) {
          resolve(diff);
        }
      });
    }
  });
}

function compareResources(res1, res2) {
  var propParser = new PropertiesParser();

  return new Promise(function (resolve, reject) {
    var resDiff = new ResourceDiff();

    var res1Struct = getResource(res1.path);
    var res2Struct = getResource(res2.path);

    var it = Object.keys(res1Struct).length +
             Object.keys(res2Struct).length;

    for (var entryId in res2Struct) {
      if (!(entryId in res1Struct)) {
        resDiff.entries.push(['obsolete', entryId]);
      }

      if (--it === 0) {
        resolve(resDiff);
      }
    }

    for (var entryId in res1Struct) {
      if (!(entryId in res2Struct)) {
        resDiff.entries.push(['missing', entryId]);

        if (--it === 0) {
          resolve(resDiff);
        }
      } else {
        compareEntries(res1Struct[entryId], res2Struct[entryId], entryId).then(function(entryId, entryDiff) {
          resDiff.entries.push(['present', entryId, entryDiff]);

          if (--it === 0) {
            resolve(resDiff);
          }
        }.bind(this, entryId));
      }
    }
  });
}

function compareEntries(entry1, entry2, entryId) {
  return new Promise(function (resolve, reject) {
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

    resolve(entryDiff);
  });
}

exports.compareLangpacks = compareLangpacks;

