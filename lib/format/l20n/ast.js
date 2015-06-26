'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _get = function get(_x6, _x7, _x8) { var _again = true; _function: while (_again) { var object = _x6, property = _x7, receiver = _x8; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x6 = parent; _x7 = property; _x8 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Node = (function () {
  function Node() {
    _classCallCheck(this, Node);

    this.type = this.constructor.name;
  }

  _createClass(Node, [{
    key: 'setPosition',
    value: function setPosition(start, end) {
      this._pos = { start: start, end: end };
    }
  }]);

  return Node;
})();

var Entry = (function (_Node) {
  function Entry() {
    _classCallCheck(this, Entry);

    _get(Object.getPrototypeOf(Entry.prototype), 'constructor', this).call(this);
  }

  _inherits(Entry, _Node);

  return Entry;
})(Node);

var Identifier = (function (_Node2) {
  function Identifier(name) {
    _classCallCheck(this, Identifier);

    _get(Object.getPrototypeOf(Identifier.prototype), 'constructor', this).call(this);
    this.name = name;
  }

  _inherits(Identifier, _Node2);

  return Identifier;
})(Node);

var Variable = (function (_Node3) {
  function Variable(name) {
    _classCallCheck(this, Variable);

    _get(Object.getPrototypeOf(Variable.prototype), 'constructor', this).call(this);
    this.name = name;
  }

  _inherits(Variable, _Node3);

  return Variable;
})(Node);

var Global = (function (_Node4) {
  function Global(name) {
    _classCallCheck(this, Global);

    _get(Object.getPrototypeOf(Global.prototype), 'constructor', this).call(this);
    this.name = name;
  }

  _inherits(Global, _Node4);

  return Global;
})(Node);

var Value = (function (_Node5) {
  function Value() {
    _classCallCheck(this, Value);

    _get(Object.getPrototypeOf(Value.prototype), 'constructor', this).call(this);
  }

  _inherits(Value, _Node5);

  return Value;
})(Node);

var String = (function (_Value) {
  function String(source, content) {
    _classCallCheck(this, String);

    _get(Object.getPrototypeOf(String.prototype), 'constructor', this).call(this);
    this.source = source;
    this.content = content;

    this._opchar = '"';
  }

  _inherits(String, _Value);

  return String;
})(Value);

var Hash = (function (_Value2) {
  function Hash(items) {
    _classCallCheck(this, Hash);

    _get(Object.getPrototypeOf(Hash.prototype), 'constructor', this).call(this);
    this.items = items;
  }

  _inherits(Hash, _Value2);

  return Hash;
})(Value);

var Entity = (function (_Entry) {
  function Entity(id) {
    var value = arguments[1] === undefined ? null : arguments[1];
    var index = arguments[2] === undefined ? null : arguments[2];
    var attrs = arguments[3] === undefined ? [] : arguments[3];

    _classCallCheck(this, Entity);

    _get(Object.getPrototypeOf(Entity.prototype), 'constructor', this).call(this);
    this.id = id;
    this.value = value;
    this.index = index;
    this.attrs = attrs;
  }

  _inherits(Entity, _Entry);

  return Entity;
})(Entry);

var Resource = (function (_Node6) {
  function Resource() {
    _classCallCheck(this, Resource);

    _get(Object.getPrototypeOf(Resource.prototype), 'constructor', this).call(this);
    this.body = [];
  }

  _inherits(Resource, _Node6);

  return Resource;
})(Node);

var Attribute = (function (_Node7) {
  function Attribute(id, value) {
    var index = arguments[2] === undefined ? null : arguments[2];

    _classCallCheck(this, Attribute);

    _get(Object.getPrototypeOf(Attribute.prototype), 'constructor', this).call(this);
    this.id = id;
    this.value = value;
    this.index = index;
  }

  _inherits(Attribute, _Node7);

  return Attribute;
})(Node);

var HashItem = (function (_Node8) {
  function HashItem(id, value, defItem) {
    _classCallCheck(this, HashItem);

    _get(Object.getPrototypeOf(HashItem.prototype), 'constructor', this).call(this);
    this.id = id;
    this.value = value;
    this['default'] = defItem;
  }

  _inherits(HashItem, _Node8);

  return HashItem;
})(Node);

var Comment = (function (_Entry2) {
  function Comment(body) {
    _classCallCheck(this, Comment);

    _get(Object.getPrototypeOf(Comment.prototype), 'constructor', this).call(this);
    this.body = body;
  }

  _inherits(Comment, _Entry2);

  return Comment;
})(Entry);

var Expression = (function (_Node9) {
  function Expression() {
    _classCallCheck(this, Expression);

    _get(Object.getPrototypeOf(Expression.prototype), 'constructor', this).call(this);
  }

  _inherits(Expression, _Node9);

  return Expression;
})(Node);

var PropertyExpression = (function (_Expression) {
  function PropertyExpression(idref, exp) {
    var computed = arguments[2] === undefined ? false : arguments[2];

    _classCallCheck(this, PropertyExpression);

    _get(Object.getPrototypeOf(PropertyExpression.prototype), 'constructor', this).call(this);
    this.idref = idref;
    this.exp = exp;
    this.computed = computed;
  }

  _inherits(PropertyExpression, _Expression);

  return PropertyExpression;
})(Expression);

var CallExpression = (function (_Expression2) {
  function CallExpression(callee, args) {
    _classCallCheck(this, CallExpression);

    _get(Object.getPrototypeOf(CallExpression.prototype), 'constructor', this).call(this);
    this.callee = callee;
    this.args = args;
  }

  _inherits(CallExpression, _Expression2);

  return CallExpression;
})(Expression);

var JunkEntry = (function (_Entry3) {
  function JunkEntry(content) {
    _classCallCheck(this, JunkEntry);

    _get(Object.getPrototypeOf(JunkEntry.prototype), 'constructor', this).call(this);
    this.content = content;
  }

  _inherits(JunkEntry, _Entry3);

  return JunkEntry;
})(Entry);

exports['default'] = {
  Identifier: Identifier,
  Value: Value,
  String: String,
  Hash: Hash,
  Entity: Entity,
  Resource: Resource,
  Attribute: Attribute,
  HashItem: HashItem,
  Comment: Comment,
  Variable: Variable,
  Global: Global,
  Expression: Expression,
  PropertyExpression: PropertyExpression,
  CallExpression: CallExpression,
  JunkEntry: JunkEntry };
module.exports = exports['default'];

