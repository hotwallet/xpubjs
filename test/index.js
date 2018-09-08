const deriveXpub = require('..')
const assert = require('assert')

const tests = [
  {
    description: 'Bitcoin Legacy',
    symbol: 'BTC',
    derivationPath: "44'/0'/0'",
    pubKey: '0430fc13a63d13b5c5549412bb4e29c3e2ec215b706d15b1c64cf211b0d889be03829428537dc7849ba50056b587ec60d0cb8d879d231ac09ac9c41c0c52cf0486',
    chainCode: '2858c1a102c2eb89c9f5ffe5424a886402d79e32d04d01c6e9eac575a3071019',
    parentPubKey: '0485827e432f88eff022a5736fe7cf3a7e69c5765135b147449607af423d6b1d6ae0fe565f42619bd00f1cc56b3d48f9257d7f75bd7d944c65d3e5f0337d1c92b5',
    expectedXpub: 'xpub6DPkczA7jHG86ay34mywRpJ7Qhy5Cwrs8ZbNfn7rf5r6scqHVVPRaREHaUcdaQrUqQuiMrM5rNRJMbDYCW3yN2MrP98AFLN4zr4tNvYwhqA'
  },
  {
    description: 'Litecoin Legacy',
    symbol: 'LTC',
    derivationPath: "44'/2'/0'",
    pubKey: '04fb33d6ed2eb9fe1bb802bab40a176456440fa0ded167dd0b4d1fdcc34d3e121f3bdbc5b8117a16dd6cdce356ac048d2c1b7a00173a439a2d5888ed2fecaa3275',
    chainCode: '81edce9a42d025c0b11459a612ad6254da788c80daf4c136aebc8f132a52a3ab',
    parentPubKey: '04da59251ddc11c645347e4af3562faba5d47710063c3991732f1989b6255a8f609581283e126603111697a5c307e65ceb3a836fd24909448daadc703f8a4cfc87',
    expectedXpub: 'Ltub2ZQsqbtvMkmEMVmY4imfiG9gY3cJU9pTB3DcCQmFCFo4WmfRboGAgNWyjG398vjHBDPjYeFoXrvrb83ZKwzTf7CJBcwtpsqSR87e8tGQRAU'
  }
]

tests.forEach(test => {
  const xpub = deriveXpub(test)
  console.log(test.description)
  console.log('expected xpub:', test.expectedXpub)
  console.log('         xpub:', xpub)
  assert.ok(test.expectedXpub === xpub, 'incorrect xpub')
})
