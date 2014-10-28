'use strict';

function delegate(ctor, proto) {
  ctor.prototype = Object.create(proto, {
    constructor: { value: ctor },
  });
}

delegate(L10nError, Error.prototype);
function L10nError(message, id, loc) {
  this.name = 'L10nError';
  this.message = message;
  this.id = id;
  this.loc = loc;
}

delegate(ParseError, L10nError.prototype);
function ParseError(message, pos, context) {
  L10nError.call(this);
  this.name = 'ParseError';
  this.pos = pos;
  this.context = context;
}

exports.L10nError = L10nError;
exports.ParseError = ParseError;
