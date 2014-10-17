'use strict';

function Langpack(uri, localeCode, basePath) {
  this.uri = uri;
  this.code = localeCode;
  this.path = basePath;
  this.type = {
    app: 'gaia',
    structure: 'source'
  };
  this.resources = {};
}

function Resource(id, resPath) {
  this.id = id;
  this.path = resPath;
}

exports.Langpack = Langpack;
exports.Resource = Resource;
