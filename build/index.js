'use strict';

var networks = require('./networks');
var bs58 = require('bs58');
var bip32 = require('bip32');
var shajs = require('sha.js');
var RIPEMD160 = require('ripemd160');
var padStart = require('lodash.padstart');
var bitcoinjs = require('bitcoinjs-lib');

function sha256(buffer) {
  return shajs('sha256').update(buffer).digest();
}

function ripemd160(buffer) {
  return new RIPEMD160().update(buffer).digest();
}

function parseHexString(str) {
  var result = [];
  while (str.length >= 2) {
    result.push(parseInt(str.substring(0, 2), 16));
    str = str.substring(2, str.length);
  }
  return result;
}

function compressPublicKey(publicKey) {
  var compressedKeyIndex = void 0;
  if (publicKey.substring(0, 2) !== '04') {
    throw 'Invalid public key format';
  }
  if (parseInt(publicKey.substring(128, 130), 16) % 2 !== 0) {
    compressedKeyIndex = '03';
  } else {
    compressedKeyIndex = '02';
  }
  return compressedKeyIndex + publicKey.substring(2, 66);
}

function toHexDigit(number) {
  var digits = '0123456789abcdef';
  return digits.charAt(number >> 4) + digits.charAt(number & 0x0f);
}

function toHexInt(number) {
  return toHexDigit(number >> 24 & 0xff) + toHexDigit(number >> 16 & 0xff) + toHexDigit(number >> 8 & 0xff) + toHexDigit(number & 0xff);
}

function encodeBase58Check(vchIn) {
  vchIn = parseHexString(vchIn);
  var chksum = sha256(vchIn);
  chksum = sha256(chksum);
  chksum = chksum.slice(0, 4);
  var hash = vchIn.concat(Array.from(chksum));
  return bs58.encode(hash);
}

function createXPUB(depth, fingerprint, childnum, chaincode, publicKey, network) {
  var xpub = toHexInt(network);
  xpub = xpub + padStart(depth.toString(16), 2, '0');
  xpub = xpub + padStart(fingerprint.toString(16), 8, '0');
  xpub = xpub + padStart(childnum.toString(16), 8, '0');
  xpub = xpub + chaincode;
  xpub = xpub + publicKey;
  return xpub;
}

function getNetworkBySymbol(symbol) {
  var networkId = Object.keys(networks).find(function (id) {
    return networks[id].unit === symbol;
  });
  return networks[networkId];
}

function deriveExtendedPublicKey() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      symbol = _ref.symbol,
      derivationPath = _ref.derivationPath,
      pubKey = _ref.pubKey,
      chainCode = _ref.chainCode,
      parentPubKey = _ref.parentPubKey;

  var network = getNetworkBySymbol(symbol).bitcoinjs;
  if (!network) throw new Error('Symbol \'' + symbol + '\' not supported');
  var finalize = function finalize(fingerprint) {
    var publicKey = compressPublicKey(pubKey);
    var path = derivationPath.split('/');
    var depth = path.length;
    var lastChild = path[path.length - 1].split('\'');
    var childnum = lastChild.length === 1 ? parseInt(lastChild[0]) : (0x80000000 | parseInt(lastChild[0])) >>> 0;
    var xpub = createXPUB(depth, fingerprint, childnum, chainCode, publicKey, network.bip32.public);
    return encodeBase58Check(xpub);
  };
  var parentPublicKey = compressPublicKey(parentPubKey);
  var parentPublicKeyIntArray = parseHexString(parentPublicKey);
  var hash = sha256(parentPublicKeyIntArray);
  var result = ripemd160(hash);
  var fingerprint = (result[0] << 24 | result[1] << 16 | result[2] << 8 | result[3]) >>> 0;
  return finalize(fingerprint);
}

var deriveAddress = function deriveAddress(_ref2) {
  var symbol = _ref2.symbol,
      xpub = _ref2.xpub,
      path = _ref2.path;

  var network = getNetworkBySymbol(symbol).bitcoinjs;
  var pubkey = bip32.fromBase58(xpub, network).derivePath(path);
  return bitcoinjs.payments.p2pkh({ pubkey: pubkey.publicKey, network: network }).address;
};

// const toPrefixBuffer = network => {
//   return {
//     ...network,
//     messagePrefix: Buffer.concat([
//       Buffer.from([network.messagePrefix.length + 1]),
//       Buffer.from(network.messagePrefix + "\n", "utf8")
//     ]).toString('hex')
//   }
// }
//
// const deriveAddress = (path, segwit, symbol, xpub58) => {
//   const bitcoin = bitcoinjs
//   const network = networks.find(n => n.symbol === symbol)
//   var script = segwit ? network.scriptHash : network.pubKeyHash
//   var hdnode = bitcoin.HDNode.fromBase58(
//     xpub58,
//     toPrefixBuffer(Networks[coin].bitcoinjs)
//   );
//   var pubKeyToSegwitAddress = (pubKey, scriptVersion, segwit) => {
//     var script = [0x00, 0x14].concat(
//       Array.from(bitcoin.crypto.hash160(pubKey))
//     );
//     var hash160 = bitcoin.crypto.hash160(script);
//     return bitcoin.address.toBase58Check(hash160, scriptVersion);
//   };
//
//   var getPublicAddress = (hdnode, path, script, segwit) => {
//     hdnode = hdnode.derivePath(
//       path
//         .split("/")
//         .splice(3, 2)
//         .join("/")
//     );
//     if (!segwit) {
//       return hdnode.getAddress().toString();
//     } else {
//       return pubKeyToSegwitAddress(hdnode.getPublicKeyBuffer(), script, segwit);
//     }
//   };
//   try {
//     return getPublicAddress(hdnode, path, script, segwit);
//   } catch (e) {
//     throw e;
//   }
// }

exports.deriveExtendedPublicKey = deriveExtendedPublicKey;
exports.deriveAddress = deriveAddress;