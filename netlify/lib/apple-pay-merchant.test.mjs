import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { configFromEnv, isAppleValidationUrl, requestMerchantSession } from './apple-pay-merchant.mjs'

describe('configFromEnv', () => {
  const full = {
    APPLE_PAY_MERCHANT_ID: 'merchant.com.buddington',
    APPLE_PAY_MERCHANT_CERT: '-----BEGIN CERTIFICATE-----\\nAAA\\n-----END CERTIFICATE-----',
    APPLE_PAY_MERCHANT_KEY: '-----BEGIN PRIVATE KEY-----\\nBBB\\n-----END PRIVATE KEY-----',
  }

  test('returns null when nothing is configured', () => {
    assert.equal(configFromEnv({}), null)
  })

  test('returns null when only part of the set is present', () => {
    assert.equal(configFromEnv({ APPLE_PAY_MERCHANT_ID: 'merchant.x' }), null)
    const { APPLE_PAY_MERCHANT_KEY, ...noKey } = full
    assert.equal(configFromEnv(noKey), null)
  })

  test('unescapes newlines so env-stored PEMs parse', () => {
    const c = configFromEnv(full)
    assert.ok(c.cert.includes('\n'))
    assert.ok(!c.cert.includes('\\n'))
    assert.ok(c.key.startsWith('-----BEGIN PRIVATE KEY-----\n'))
  })

  test('display name defaults to the house name', () => {
    assert.equal(configFromEnv(full).displayName, 'Buddington')
    assert.equal(configFromEnv({ ...full, APPLE_PAY_DISPLAY_NAME: 'Ghost' }).displayName, 'Ghost')
  })
})

describe('isAppleValidationUrl', () => {
  test('accepts Apple hosts over https', () => {
    assert.ok(isAppleValidationUrl('https://apple-pay-gateway.apple.com/paymentservices/startSession'))
    assert.ok(isAppleValidationUrl('https://cn-apple-pay-gateway.apple.com/x'))
    assert.ok(isAppleValidationUrl('https://apple.com/x'))
  })

  test('rejects non-Apple hosts — the cert must not leave for someone else', () => {
    assert.equal(isAppleValidationUrl('https://evil.example.com/startSession'), false)
    assert.equal(isAppleValidationUrl('https://apple.com.evil.example/x'), false)
    assert.equal(isAppleValidationUrl('https://notapple.com/x'), false)
  })

  test('rejects lookalikes that merely contain the word apple', () => {
    assert.equal(isAppleValidationUrl('https://apple.com.attacker.net/'), false)
    assert.equal(isAppleValidationUrl('https://myapple.com/'), false)
  })

  test('rejects plaintext and non-URLs', () => {
    assert.equal(isAppleValidationUrl('http://apple.com/x'), false)
    assert.equal(isAppleValidationUrl('not a url'), false)
    assert.equal(isAppleValidationUrl(''), false)
  })
})

describe('requestMerchantSession', () => {
  const config = { merchantId: 'merchant.com.buddington', displayName: 'Buddington', cert: 'c', key: 'k' }

  test('refuses a validation URL that is not Apple', async () => {
    await assert.rejects(
      requestMerchantSession({
        config,
        validationURL: 'https://evil.example.com/startSession',
        domain: 'buddington.example',
        fetchImpl: () => Promise.resolve({}),
      }),
      /invalid-validation-url/,
    )
  })

  test('sends the merchant identifier and the page domain as context', async () => {
    let sent
    await requestMerchantSession({
      config,
      validationURL: 'https://apple-pay-gateway.apple.com/paymentservices/startSession',
      domain: 'buddington.example',
      fetchImpl: (_url, payload) => { sent = JSON.parse(payload); return Promise.resolve({ ok: true }) },
    })
    assert.equal(sent.merchantIdentifier, 'merchant.com.buddington')
    assert.equal(sent.initiative, 'web')
    assert.equal(sent.initiativeContext, 'buddington.example')
  })
})
