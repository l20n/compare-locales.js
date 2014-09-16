'use strict';

var fs = require('fs');
var Promise = require('promise');

function Langpack(uri, localeCode, basePath) {
  this.uri = uri;
  this.code = localeCode;
  this.path = basePath;
  this.type = Langpack.LANGPACK_TYPES['source'];
  this.resources = [];
}

Langpack.LANGPACK_TYPES = {
  source: 0,
  dir: 1,
};
 

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

exports.Langpack = Langpack;
exports.Directory = Directory;

