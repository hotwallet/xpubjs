const Amount = require('./Amount')
const ByteString = require('./ByteString')
const Convert = require('./Convert')
const leftPad = require('./leftPad')
const RIPEMD160 = require('./ripemd160')
const SHA256 = require('./sha256')

const ripemd160 = new RIPEMD160()
const sha256 = new SHA256()

function compressPublicKey(publicKeyInput) {
  const publicKey = new ByteString(publicKeyInput, 'HEX')
  var prefix = ((publicKey.byteAt(64) & 1) != 0 ? 0x03 : 0x02);
  return new ByteString(Convert.toHexByte(prefix), 'HEX').concat(publicKey.bytes(1, 32));
}

function b58Encode(v) {
  const __b58chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  var div, i, long_value, mod, result, value256, _i, _ref;
  long_value = Amount.fromSatoshi(0);
  value256 = Amount.fromSatoshi(256);
  for (i = _i = _ref = v.length - 1; _ref <= 0 ? _i <= 0 : _i >= 0; i = _ref <= 0 ? ++_i : --_i) {
    long_value = long_value.add(value256.pow(v.length - i - 1).multiply(v.byteAt(i)));
  }
  result = '';
  while (long_value.gte(__b58chars.length)) {
    div = long_value.divide(__b58chars.length);
    mod = long_value.mod(__b58chars.length);
    result = __b58chars[mod.toNumber()] + result;
    long_value = div;
  }
  return __b58chars[long_value.toNumber()] + result;
}

/**
 * Convert a byte array to hex string.
 *
 * Exemple [10, 16] will be converted to "0A10".
 *
 * @param {byte[]} arr
 */
function byteArrayToHexStr(arr) {
  var len = arr.length;
  var str = "";
  for (var i = 0; i<len; i++) {
    var x = (arr[i]&0x00FF).toString(16);
    if (x.length&1) {
      str  = str+"0"+x;
    } else {
      str  = str+x;
    }
  }
  return str;
}

function encodeBase58Check(vchIn) {
  var hash;
  hash = sha256.finalize(vchIn.toString('HEX'));
  hash = sha256.finalize(byteArrayToHexStr(hash));
  hash = new ByteString(byteArrayToHexStr(hash), 'HEX').bytes(0, 4);
  hash = vchIn.concat(hash);
  return b58Encode(hash);
}

function createXpub(depth, fingerprint, childnum, chainCode, publicKey) {
  // const magic = Convert.toHexInt(ledger.config.network.version.XPUB);
  const magic = Convert.toHexInt(0x0488B21E)
  let xpub = new ByteString(magic, 'HEX');
  xpub = xpub.concat(new ByteString(leftPad(depth.toString(16), 2, '0'), 'HEX'));
  xpub = xpub.concat(new ByteString(leftPad(fingerprint.toString(16), 8, '0'), 'HEX'));
  xpub = xpub.concat(new ByteString(leftPad(childnum.toString(16), 8, '0'), 'HEX'));
  xpub = xpub.concat(new ByteString(chainCode.toString('HEX'), 'HEX'));
  xpub = xpub.concat(new ByteString(publicKey.toString('HEX'), 'HEX'));
  return xpub;
}

function finalize(fingerprint, pubKey, chainCode, derivationPath) {
  const publicKey = compressPublicKey(pubKey);
  const path = derivationPath.split('/')
  const depth = path.length
  const lastChild = path[path.length - 1].split('\'');
  const childnum = (lastChild.length === 1) ? parseInt(lastChild[0]) : (0x80000000 | parseInt(lastChild[0])) >>> 0;
  const xpub = createXpub(depth, fingerprint, childnum, chainCode, publicKey);
  return encodeBase58Check(xpub)
}


function deriveXpub({ parentPubKey, pubKey, chainCode, derivationPath }) {
  const parentPublicKey = compressPublicKey(parentPubKey);
  let result = sha256.finalize(parentPublicKey.toString('HEX'));
  result = new ByteString(byteArrayToHexStr(result), 'HEX');
  result = ripemd160.finalize(result.toString('HEX'));
  const fingerprint = ((result[0] << 24) | (result[1] << 16) | (result[2] << 8) | result[3]) >>> 0;
  return finalize(fingerprint, pubKey, chainCode, derivationPath);
}

module.exports = deriveXpub