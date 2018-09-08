const networks = require('./networks')
const bs58 = require('bs58')
const shajs = require('sha.js')
const RIPEMD160 = require('ripemd160')
const padStart = require('lodash.padstart')

function sha256 (buffer) {
  return shajs('sha256').update(buffer).digest()
}

function ripemd160(buffer) {
  return (new RIPEMD160().update(buffer).digest())
}

function parseHexString(str) {
  const result = []
  while (str.length >= 2) {
    result.push(parseInt(str.substring(0, 2), 16))
    str = str.substring(2, str.length)
  }
  return result
}

function compressPublicKey(publicKey) {
  let compressedKeyIndex
  if (publicKey.substring(0, 2) !== '04') {
    throw 'Invalid public key format'
  }
  if (parseInt(publicKey.substring(128, 130), 16) % 2 !== 0) {
    compressedKeyIndex = '03'
  } else {
    compressedKeyIndex = '02'
  }
  return compressedKeyIndex + publicKey.substring(2, 66)
}

function toHexDigit(number) {
  const digits = '0123456789abcdef'
  return digits.charAt(number >> 4) + digits.charAt(number & 0x0f)
}

function toHexInt(number) {
  return (
    toHexDigit((number >> 24) & 0xff) +
    toHexDigit((number >> 16) & 0xff) +
    toHexDigit((number >> 8) & 0xff) +
    toHexDigit(number & 0xff)
  )
}

function encodeBase58Check(vchIn) {
  vchIn = parseHexString(vchIn)
  let chksum = sha256(vchIn)
  chksum = sha256(chksum)
  chksum = chksum.slice(0, 4)
  const hash = vchIn.concat(Array.from(chksum))
  return bs58.encode(hash)
}

function createXPUB(
  depth,
  fingerprint,
  childnum,
  chaincode,
  publicKey,
  network
) {
  let xpub = toHexInt(network)
  xpub = xpub + padStart(depth.toString(16), 2, '0')
  xpub = xpub + padStart(fingerprint.toString(16), 8, '0')
  xpub = xpub + padStart(childnum.toString(16), 8, '0')
  xpub = xpub + chaincode
  xpub = xpub + publicKey
  return xpub
}

function deriveXpub({ symbol, derivationPath, pubKey, chainCode, parentPubKey } = {}) {
  const network = networks.find(n => n.symbol === symbol)
  if (!network) throw new Error(`Symbol '${symbol}' not supported`)
  const finalize = fingerprint => {
    const publicKey = compressPublicKey(pubKey)
    const path = derivationPath.split('/')
    const depth = path.length
    const lastChild = path[path.length - 1].split('\'')
    const childnum = (lastChild.length === 1) ? parseInt(lastChild[0]) : (0x80000000 | parseInt(lastChild[0])) >>> 0
    const xpub = createXPUB(
      depth,
      fingerprint,
      childnum,
      chainCode,
      publicKey,
      network.xpub
    )
    return encodeBase58Check(xpub)
  }
  const parentPublicKey = compressPublicKey(parentPubKey)
  const parentPublicKeyIntArray = parseHexString(parentPublicKey)
  const hash = sha256(parentPublicKeyIntArray)
  const result = ripemd160(hash)
  const fingerprint = ((result[0] << 24) | (result[1] << 16) | (result[2] << 8) | result[3]) >>> 0
  return finalize(fingerprint)
}

module.exports = deriveXpub