const { deriveExtendedPublicKey, deriveAddress } = require('..')
const assert = require('assert')

const tests = [
  {
    description: 'Bitcoin Legacy',
    symbol: 'BTC',
    derivationPath: "44'/0'/0'",
    pubKey: '0430fc13a63d13b5c5549412bb4e29c3e2ec215b706d15b1c64cf211b0d889be03829428537dc7849ba50056b587ec60d0cb8d879d231ac09ac9c41c0c52cf0486',
    chainCode: '2858c1a102c2eb89c9f5ffe5424a886402d79e32d04d01c6e9eac575a3071019',
    parentPubKey: '0485827e432f88eff022a5736fe7cf3a7e69c5765135b147449607af423d6b1d6ae0fe565f42619bd00f1cc56b3d48f9257d7f75bd7d944c65d3e5f0337d1c92b5',
    expectedXpub: 'xpub6DPkczA7jHG86ay34mywRpJ7Qhy5Cwrs8ZbNfn7rf5r6scqHVVPRaREHaUcdaQrUqQuiMrM5rNRJMbDYCW3yN2MrP98AFLN4zr4tNvYwhqA',
    addresses: {
      '0/0': '142PVXZttFjSpeeERJ17JEBNfLGnzjo9VJ'
    }
  },
  {
    description: 'Bitcoin Segwit',
    symbol: 'BTC',
    derivationPath: "49'/0'/0'",
    pubKey: '04279879f0035fa142f9a65bf4a4943539ea5ef5d11c617d81d7e47ae100fe472bdfa05a4ce2c84ccf08d331727c01da3dbc60728a36eb4a5031dc715f2d18a930',
    chainCode: '9c26c75bb2101893e7f1772cd795e752239702c07b1f14cd931febc6aee19259',
    parentPubKey: '0443b91a2946e64e9a6beebe983638823c873c8ed9caf566d274679911263b55385f8607c683df216952b5df197986d8fb0f4fd476c2dab14d8757add90144d1cc',
    expectedXpub: 'xpub6BuPg4WfGBbDUadCCw4rDfvGLM6gRky5MiUrXrkucffVmiKuLtBy1qvbrQqFrJwb2DoUPbxGd3ftyonVE8xAHWZWKhKpxEoUiqcoeieLuun',
    addresses: {
      '0/0': '3Fp5otnVs9xcEmcogAy5r9jqdiYFmy6tri'
    },
    isSegwit: true
  },
  {
    description: 'Litecoin Legacy',
    symbol: 'LTC',
    derivationPath: "44'/2'/0'",
    pubKey: '04fb33d6ed2eb9fe1bb802bab40a176456440fa0ded167dd0b4d1fdcc34d3e121f3bdbc5b8117a16dd6cdce356ac048d2c1b7a00173a439a2d5888ed2fecaa3275',
    chainCode: '81edce9a42d025c0b11459a612ad6254da788c80daf4c136aebc8f132a52a3ab',
    parentPubKey: '04da59251ddc11c645347e4af3562faba5d47710063c3991732f1989b6255a8f609581283e126603111697a5c307e65ceb3a836fd24909448daadc703f8a4cfc87',
    expectedXpub: 'Ltub2ZQsqbtvMkmEMVmY4imfiG9gY3cJU9pTB3DcCQmFCFo4WmfRboGAgNWyjG398vjHBDPjYeFoXrvrb83ZKwzTf7CJBcwtpsqSR87e8tGQRAU',
    addresses: {
      '0/0': 'LVP2DzdJYmXjf3c9Lkk5UezSNvbfZ1w1Vy'
    }
  },
  {
    description: 'Litecoin Segwit',
    symbol: 'LTC',
    derivationPath: "49'/2'/0'",
    pubKey: '04c2d9d2da3537f343c934fa489233e944d0b71cd6336642222584a4948081e5433f05be85ab215cd8bc6773a4330a6df51d3cb5e6c9951e9c202d862ae0c86f7c',
    chainCode: '099c01f9553877ae0717b108ea25c5134195c89572719020730d6cd2111751eb',
    parentPubKey: '04e33a74e28fa6cfa96136e91107439dcc39a9554dd2fd30df60e23d845ef6f5cfeec6d716fc37f90f41706ec1c2f5508a0b067c5cd5f17c83f35b29fc86e3d19e',
    expectedXpub: 'Ltub2ZwbdGF9asJRd6cZPW8LpUeNn2oiGmjd3zrwJFKvmVvQnJ12X8daYQH5AMo4TF64YeCJ6ozZAJg4DhRzDA4y1etmB3u6cUZeLaNaHyjDPsF',
    addresses: {
      '0/0': 'MLRCgKUNmx3MqWkqydLf32cUNvJDhDynBh' // 3ED4NS4QpqBw31UwskMKDPN54DhmdZnPG2
    },
    isSegwit: true
  },
  {
    description: 'Zcash',
    symbol: 'ZEC',
    derivationPath: "44'/133'/0'",
    pubKey: '046996de2681e59b358e10c668bcb8ce26104b7fa07423a626e3a7679d8ff500634a72e6d2426a2b4e2318ed5d6cdfaed48e05b627a2750abbf59a9afda39b58ac',
    chainCode: '69a1d20f7ea51077c719660a2db8ef7d3088617ad75a239c5d4f56588fd8060f',
    parentPubKey: '045ba306dba9c3c79caaa14000732be18438961ef92cebb1865f3031ff3f2df7c4d7ef64eeb93f8b8508794e4e8482255ba2dc4543c7625299b1da06e260d98487',
    expectedXpub: 'xpub6BwVBJCU3LapvQRTsehENsGudMMNBuQxVNKveXhMvYoCnYpsuoxqVsbP872adL93JvU9xL8XgN4JJWtzfSjv1rdJVAfzWt2UZbRZGXxHkGJ',
    addresses: {
      '0/0': 't1Zmzbzv9ZUDTbvvHYgDg7jJHcZ9qSdamia'
    }
  }
]

console.log('----------')

tests.forEach(test => {
  const { symbol, derivationPath, pubKey, chainCode, parentPubKey, isSegwit } = test
  const xpub = deriveExtendedPublicKey({ symbol, derivationPath, pubKey, chainCode, parentPubKey })
  console.log(test.description)
  console.log('xpub:', xpub)
  assert.ok(test.expectedXpub === xpub, 'incorrect xpub')
  Object.keys(test.addresses).forEach(path => {
    const address = deriveAddress({ symbol, xpub, path, isSegwit })
    console.log(path, address)
    assert.ok(test.addresses[path] === address, `expecting address ${test.addresses[path]}`)
  })
  console.log('----------')
})

console.log('Done.')
