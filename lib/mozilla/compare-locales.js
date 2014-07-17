'use strict';

function compareApp(app) {
}

function compareLangPacks(lp1, lp2) {

}

function compareDirectories(dir1, dir2) {
  dir1.getDirectories().then(function(results) {
    for (var i = 0; i < results.length; i++) {
      console.log(results[i]);
    }
  });
}

exports.compareApp = compareApp;
exports.compareDirectories = compareDirectories;

