const deriveXpub = require('..')
const assert = require('assert')

const derivationPath = "44'/0'/0'"
const pubKey = '0430fc13a63d13b5c5549412bb4e29c3e2ec215b706d15b1c64cf211b0d889be03829428537dc7849ba50056b587ec60d0cb8d879d231ac09ac9c41c0c52cf0486'
const chainCode = '2858c1a102c2eb89c9f5ffe5424a886402d79e32d04d01c6e9eac575a3071019'
const parentPubKey = '0485827e432f88eff022a5736fe7cf3a7e69c5765135b147449607af423d6b1d6ae0fe565f42619bd00f1cc56b3d48f9257d7f75bd7d944c65d3e5f0337d1c92b5'

const expectedXpub = 'xpub6DPkczA7jHG86ay34mywRpJ7Qhy5Cwrs8ZbNfn7rf5r6scqHVVPRaREHaUcdaQrUqQuiMrM5rNRJMbDYCW3yN2MrP98AFLN4zr4tNvYwhqA'

const xpub = deriveXpub({ derivationPath, pubKey, chainCode, parentPubKey })

console.log('expected xpub:', expectedXpub)
console.log('         xpub:', xpub)

assert.ok(expectedXpub === xpub, 'incorrect xpub')
