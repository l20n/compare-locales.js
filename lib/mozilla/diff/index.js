'use strict';

function LangpackDiff(code, entries) {
  this.code = code;
  this.entries = entries;
}

function ResourceDiff(entries) {
  this.entries = entries;
}

function EntryDiff(id) {
  this.id = id;
  this.elements = [];
  this.messages = [];
}

function listDiff(list1, list2) {
  var diff = [];

  list1.forEach(function(elem) {
    if (list2.indexOf(elem) !== -1) {
      diff.push([elem, 'both']);
    } else {
      diff.push([elem, 'list1']);
    }
  });

  list2.forEach(function(elem) {
    if (list1.indexOf(elem) === -1) {
      diff.push([elem, 'list2']);
    }
  });
  return diff;
}

exports.LangpackDiff = LangpackDiff;
exports.ResourceDiff = ResourceDiff;
exports.EntryDiff = EntryDiff;
exports.listDiff = listDiff;
