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

exports.L10nError = L10nError;
