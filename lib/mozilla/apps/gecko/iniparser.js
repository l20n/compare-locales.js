'use strict';

var IniParser = {
  patterns: {
    comment: /^\s*#|^\s*$/,
    entries: /[^\r\n]+/g,
    section: /^\s*\[(.*)\]\s*$/,
    entity: /^([^=\s]+)\s*=\s*(.+)$/,
    multiline: /^\s{5}(.*)$/,
  },

  parse: function(source) {
    var ini = {};

    var currentSection = null;
    var currentKey = null;

    var entries = source.match(this.patterns.entries);
    for (var i = 0; i < entries.length; i++) {
      var line = entries[i];
      var match;

      if (this.patterns.comment.test(line)) {
        continue;
      }

      match = this.patterns.section.exec(line);
      if (match) {
        currentSection = match[1];
        ini[match[1]] = {};
        continue;
      }

      match = this.patterns.entity.exec(line);
      if (match) {
        currentKey = match[1];
        ini[currentSection][match[1]] = match[2];
        continue;
      }

      match = this.patterns.multiline.exec(line);
      if (match) {
        ini[currentSection][currentKey] += ' ' + match[1];
        continue;
      }
    }
    return ini;
  },
};

module.exports = IniParser;
