import assert from 'node:assert/strict'
import { generateKeyPairSync, verify } from 'node:crypto'
import { describe, it } from 'node:test'
import {
  configFromEnv,
  MAX_TTL_SECONDS,
  mintDeveloperToken,
  normalisePem,
} from './apple-developer-token.mjs'

// A throwaway P-256 key, the curve Apple issues MusicKit keys on.
const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' })
const pem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()

const decode = (part) => JSON.parse(Buffer.from(part, 'base64url').toString())

describe('apple developer token', () => {
  const now = Date.UTC(2026, 8, 23)
  const token = mintDeveloperToken({ teamId: 'TEAM123456', keyId: 'KEY1234567', privateKey: pem, now })
  const [h, c, s] = token.split('.')

  it('has the header and claims Apple specifies', () => {
    assert.deepEqual(decode(h), { alg: 'ES256', kid: 'KEY1234567' })
    const claims = decode(c)
    assert.equal(claims.iss, 'TEAM123456')
    assert.equal(claims.iat, now / 1000)
    assert.equal(claims.exp, now / 1000 + 12 * 3600)
    assert.equal('origin' in claims, false)
  })

  it('is a valid ES256 signature over header.claims', () => {
    const sig = Buffer.from(s, 'base64url')
    assert.equal(sig.length, 64, 'JWS ES256 is raw r||s, 64 bytes')
    assert.ok(
      verify('sha256', Buffer.from(`${h}.${c}`), { key: publicKey, dsaEncoding: 'ieee-p1363' }, sig),
    )
  })

  it('fails verification if the claims are tampered with', () => {
    const forged = Buffer.from(JSON.stringify({ ...decode(c), iss: 'SOMEONEELS' })).toString('base64url')
    assert.equal(
      verify('sha256', Buffer.from(`${h}.${forged}`), { key: publicKey, dsaEncoding: 'ieee-p1363' }, Buffer.from(s, 'base64url')),
      false,
    )
  })

  it('never exceeds the six-month ceiling', () => {
    const long = mintDeveloperToken({ teamId: 'T', keyId: 'K', privateKey: pem, now, ttlSeconds: 10 ** 9 })
    const claims = decode(long.split('.')[1])
    assert.equal(claims.exp - claims.iat, MAX_TTL_SECONDS)
  })

  it('carries the origin allow-list when one is configured', () => {
    const t = mintDeveloperToken({
      teamId: 'T', keyId: 'K', privateKey: pem, now, origins: ['https://buddington.example'],
    })
    assert.deepEqual(decode(t.split('.')[1]).origin, ['https://buddington.example'])
  })

  it('accepts a key pasted with escaped newlines', () => {
    const escaped = pem.replace(/\n/g, '\\n')
    assert.equal(normalisePem(escaped), pem)
    assert.ok(mintDeveloperToken({ teamId: 'T', keyId: 'K', privateKey: escaped, now }))
  })
})

describe('configuration', () => {
  it('is absent until all three values are set', () => {
    assert.equal(configFromEnv({}), null)
    assert.equal(configFromEnv({ APPLE_MUSIC_TEAM_ID: 'T', APPLE_MUSIC_KEY_ID: 'K' }), null)
    assert.equal(configFromEnv({ APPLE_MUSIC_TEAM_ID: ' ', APPLE_MUSIC_KEY_ID: 'K', APPLE_MUSIC_PRIVATE_KEY: 'P' }), null)
  })

  it('reads origins as a trimmed list without trailing slashes', () => {
    const cfg = configFromEnv({
      APPLE_MUSIC_TEAM_ID: 'T', APPLE_MUSIC_KEY_ID: 'K', APPLE_MUSIC_PRIVATE_KEY: 'P',
      APPLE_MUSIC_ALLOWED_ORIGINS: ' https://a.example/ , https://b.example ,',
    })
    assert.deepEqual(cfg?.origins, ['https://a.example', 'https://b.example'])
  })
})

describe('function endpoint', () => {
  it('answers "not configured" as a normal response, not an error status', async () => {
    const saved = { ...process.env }
    delete process.env.APPLE_MUSIC_TEAM_ID
    const { default: handler } = await import('../functions/apple-music-token.mjs')
    const res = await handler(new Request('https://x/.netlify/functions/apple-music-token'))
    assert.equal(res.status, 200)
    assert.deepEqual(await res.json(), { configured: false })
    Object.assign(process.env, saved)
  })

  it('returns a signed token when configured, and refuses non-GET', async () => {
    Object.assign(process.env, {
      APPLE_MUSIC_TEAM_ID: 'TEAM123456', APPLE_MUSIC_KEY_ID: 'KEY1234567', APPLE_MUSIC_PRIVATE_KEY: pem,
    })
    const { default: handler } = await import('../functions/apple-music-token.mjs')
    const ok = await handler(new Request('https://x/.netlify/functions/apple-music-token'))
    assert.equal(ok.status, 200)
    const body = await ok.json()
    assert.equal(body.configured, true)
    assert.equal(decode(body.token.split('.')[0]).kid, 'KEY1234567')
    const post = await handler(new Request('https://x/', { method: 'POST' }))
    assert.equal(post.status, 405)
  })

  it('reports a malformed key as a 500 without leaking it', async () => {
    Object.assign(process.env, {
      APPLE_MUSIC_TEAM_ID: 'T2', APPLE_MUSIC_KEY_ID: 'K2', APPLE_MUSIC_PRIVATE_KEY: 'not-a-key',
    })
    // Fresh module instance so the token cache from the last test is not reused.
    const { default: handler } = await import(`../functions/apple-music-token.mjs?fresh=${Date.now()}`)
    const res = await handler(new Request('https://x/'))
    assert.equal(res.status, 500)
    const body = await res.text()
    assert.ok(!body.includes('not-a-key'))
  })
})
