'use strict';

var utils = require('../mozilla/utils.js');

var PropertiesParser = require('../format/properties.js').PropertiesParser;
var L20nParser = require('../format/l20n.js').L20nParser;

var parsers = {
  'l20n': new L20nParser(),
  'properties': new PropertiesParser() 
};

exports.parseSource = function(type, source) {
  return parsers[type].parse(source);
};

exports.getResource = function(resPath) {
  var type = resPath.substring(resPath.lastIndexOf('.') + 1);
  var parse = parsers[type].parse.bind(parsers[type]);

  return utils.getFileContent(resPath).then(parse);
};
