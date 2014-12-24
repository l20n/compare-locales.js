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

function equals(elem1, elem2) {
  if (typeof(elem1) !== typeof(elem2)) {
    return false;
  }

  if (typeof(elem1) === 'string') {
    return elem1 === elem2;
  }
  return (elem1.length === elem2.length && elem1.every(function(val, i) {
    return val === elem2[i];
  }));
}

function listDiff(list1, list2) {
  var diff = [];

  list1.forEach(function(elem) {
    var found = false;
    list2.every(function(elem2) {
      if (equals(elem, elem2)) {
        found = true;
        return false;
      }
      return true;
    });
    if (found) {
      diff.push([elem, 'both']);
    } else {
      diff.push([elem, 'list1']);
    }
  });
  console.log(diff);
  return diff;

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
