'use strict';

var fs = require('fs');
var Promise = require('promise');

function LangPack(uri) {
  this.uri = uri;
  this.type = 'dir';
}

function Directory(path) {
  this.path = path;
}

Directory.prototype.getDirectories = function () {
  return new Promise(function (resolve, reject) {
    var results = [];

    fs.readdir(this.path, function (err, files) {
      if (err) {
        reject(err);
      }

      for (var i = 0; i < files.length; i++) {
        results.push(files[i]);
      }

      resolve(results);
    });

  }.bind(this));
}

exports.LangPack = LangPack;
exports.Directory = Directory;


