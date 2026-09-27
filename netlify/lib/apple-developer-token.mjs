// Apple Music developer tokens, per Apple's "Generating Developer Tokens":
// an ES256 (ECDSA P-256 / SHA-256) JWT, header { alg, kid }, claims
// { iss: team id, iat, exp <= iat + 15777000 }, plus the `origin` allow-list
// Apple recommends for web clients. Signed with the MusicKit private key,
// which is why this runs server-side and never ships to the browser.

import { createPrivateKey, sign } from 'node:crypto'

/** Apple's ceiling: six months, in seconds. */
export const MAX_TTL_SECONDS = 15_777_000

const b64url = (value) => Buffer.from(value).toString('base64url')

/**
 * Netlify env vars often hold a .p8 with its newlines escaped as `\n`.
 * Accept both forms rather than fail on how the key was pasted.
 * @param {string} raw
 */
export function normalisePem(raw) {
  return raw.includes('\\n') ? raw.replace(/\\n/g, '\n') : raw
}

/**
 * @param {{
 *   teamId: string, keyId: string, privateKey: string,
 *   origins?: string[], now?: number, ttlSeconds?: number,
 * }} opts
 * @returns {string} signed JWT
 */
export function mintDeveloperToken({ teamId, keyId, privateKey, origins, now, ttlSeconds }) {
  const iat = Math.floor((now ?? Date.now()) / 1000)
  const ttl = Math.min(Math.max(ttlSeconds ?? 12 * 3600, 60), MAX_TTL_SECONDS)
  const header = { alg: 'ES256', kid: keyId }
  /** @type {Record<string, unknown>} */
  const claims = { iss: teamId, iat, exp: iat + ttl }
  if (origins && origins.length) claims.origin = origins

  const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claims))}`
  const key = createPrivateKey(normalisePem(privateKey))
  // JWS wants the raw r||s signature, not DER.
  const signature = sign('sha256', Buffer.from(signingInput), { key, dsaEncoding: 'ieee-p1363' })
  return `${signingInput}.${signature.toString('base64url')}`
}

/**
 * Read the configuration from the environment. Returns null when any required
 * value is missing, so the storefront can hide Apple Music connect instead of
 * offering a button that cannot work.
 * @param {Record<string, string | undefined>} env
 */
export function configFromEnv(env) {
  const teamId = env.APPLE_MUSIC_TEAM_ID?.trim()
  const keyId = env.APPLE_MUSIC_KEY_ID?.trim()
  const privateKey = env.APPLE_MUSIC_PRIVATE_KEY?.trim()
  if (!teamId || !keyId || !privateKey) return null
  const origins = (env.APPLE_MUSIC_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean)
  return { teamId, keyId, privateKey, origins }
}
