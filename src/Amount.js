const BigInteger = require('./BigInteger')
const ByteString = require('./ByteString')
const leftPad = require('./leftPad')
const isNumber = require('./isNumber')
const isString = require('./isString')

function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

function isKindOf(object, clazz) {
  switch (clazz) {
    case String:
      return isString(object);
    case Array:
      return Array.isArray(object);
    // case Function:
    //   return _.isFunction(object);
    case Number:
      return isNumber(object);
    case Object:
      return isObject(object);
  }
  while ((object != null ? object.constructor : void 0) != null) {
    if (object.constructor === clazz) {
      return true;
    }
    object = object.constructor.__super__;
  }
  return false;
}


function Amount(value) {
  if (value == null) {
    value = BigInteger.ZERO;
  }
  this._value = value.clone();
}

Amount.fromSatoshi = function(value) {
  if (isKindOf(value, Amount)) {
    return value;
  }
  if (isKindOf(value, BigInteger)) {
    return new Amount(value);
  }
  if (isKindOf(value, ByteString)) {
    return new Amount(new BigInteger(value.toString('HEX').match(/../g).reverse().join(''), 16));
  }
  return new Amount(new BigInteger(value.toString()));
};

Amount.prototype.add = function(amount) {
  amount = Amount.fromSatoshi(amount);
  return new Amount(this._value.add(amount._value));
};

Amount.prototype.subtract = function(amount) {
  amount = Amount.fromSatoshi(amount);
  return new Amount(this._value.subtract(amount._value));
};

Amount.prototype.multiply = function(number) {
  number = Amount.fromSatoshi(number);
  return new Amount(this._value.multiply(number._value));
};

Amount.prototype.pow = function(e) {
  e = Amount.fromSatoshi(e);
  return new Amount(this._value.pow(e._value));
};

Amount.prototype.mod = function(amount) {
  amount = Amount.fromSatoshi(amount);
  return new Amount(this._value.mod(amount._value));
};

Amount.prototype.divide = function(amount) {
  amount = Amount.fromSatoshi(amount);
  return new Amount(this._value.divide(amount._value));
};

Amount.prototype.compare = function(amount) {
  amount = Amount.fromSatoshi(amount);
  return this._value.compareTo(amount._value);
};

Amount.prototype.lt = function(amount) {
  return this.compare(amount) < 0;
};

Amount.prototype.lte = function(amount) {
  return this.compare(amount) <= 0;
};

Amount.prototype.gt = function(amount) {
  return this.compare(amount) > 0;
};

Amount.prototype.gte = function(amount) {
  return this.compare(amount) >= 0;
};

Amount.prototype.eq = function(amount) {
  return this.compare(amount) === 0;
};

Amount.prototype.neq = function(amount) {
  return !this.eq(amount);
};

Amount.prototype.equals = function(amount) {
  return this.eq(amount);
};

Amount.prototype.toByteString = function() {
  return new ByteString(leftPad(this.toSatoshiString(16), 16, '0'), HEX);
};

Amount.prototype.toBtcString = function(base) {
  if (base == null) {
    base = 10;
  }
  return this.toBtcNumber().toString(base);
};

Amount.prototype.toBtcNumber = function() {
  return this.toSatoshiNumber() / 1e8;
};

Amount.prototype.toBitsString = function(base) {
  if (base == null) {
    base = 10;
  }
  return this.toBitsNumber().toString(base);
};

Amount.prototype.toBitsNumber = function() {
  return this.toSatoshiNumber() / 1e2;
};

Amount.prototype.toSatoshiString = function(base) {
  if (base == null) {
    base = 10;
  }
  return this._value.toString(base);
};

Amount.prototype.toSatoshiNumber = function() {
  return this._value.intValue();
};

Amount.prototype.toBigInteger = function() {
  return this._value.clone();
};

Amount.prototype.toNumber = function() {
  return this._value.intValue();
};

Amount.prototype.toString = function(base) {
  return this._value.toString(base);
};

Amount.prototype.toScriptByteString = function() {
  var hex;
  hex = leftPad(this.toSatoshiString(16), 16, '0');
  hex = hex.match(/../g).reverse().join('');
  return new ByteString(hex, 'HEX');
};

module.exports = Amount