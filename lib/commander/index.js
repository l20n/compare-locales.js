var _version;

exports = module.exports = new Command();

function Command() {
  this.args = [];
  this._options = [];
  this._version;
}

Command.prototype.version = function(ver) {
  return this;
}

Command.prototype.usage = function(str) {
  return this;
}

Command.prototype.option = function(str, desc, def) {
  var params = str.split(' ');

  var option = {
    name: null,
    aliases: [],
    default: def
  };

  for (var i = 0; i < params.length; i++) {
    var param = params[i];

    if (param[param.length - 1] === ',') {
      param = param.slice(0, param.length - 1);
    }

    if (param.slice(0, 2) === '--') {
      option.name = param.slice(2); 
    } else if (param[0] === '-' && param.length === 2) {
      option.aliases.push(param.slice(1));
    }
  }
  this._options.push(option);
  return this;
}

Command.prototype.parse = function(argv) {
  var args = argv.slice(2);
  var len = args.length;
  var arg;
  var options = [];

  for (var i = 0; i < len; i++) {
    arg = args[i];

    if (arg.slice(0, 2) === '--' ||
        arg[0] === '-' && arg.length === 2) {
      var option = {'name': null, 'value': null};

      if (arg.slice(0, 2) === '--') {
        arg = arg.slice(2);
      } else {
        arg = arg.slice(1);
      }

      if (arg.indexOf('=') !== -1) {
        var opt = arg.split('=');
        option.name = opt[0];
        option.value = opt[1];
      } else {
        option.name = arg; 

        if (args[i + 1][0] === '-') {
          continue;
        } else {
          option.value = args[i + 1];
          i++;
        }
      }
      options.push(option);
    } else {
      this.args.push(arg);
    }
  }

  for (var i in this._options) {
    var option = this._options[i];
    this[camelcase(option.name)] = option.default;
  }

  for (var i in options) {
    var option = options[i];
    this[camelcase(option.name)] = option.value;
  }
  return this;
}

function camelcase(flag) {
  return flag.split('-').reduce(function(str, word) {
    return str + word[0].toUpperCase() + word.slice(1);
  });
}
