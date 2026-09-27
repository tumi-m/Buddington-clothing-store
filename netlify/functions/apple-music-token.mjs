// GET /.netlify/functions/apple-music-token → { configured, token }
// Hands the browser a short-lived Apple Music developer token for MusicKit.
// A store that has not set Apple Music up gets `{ configured: false }` as a
// normal 200: it is an answer, not a failure, and an error status would put a
// red console line in every shopper's browser each time they open the dock.

import { configFromEnv, mintDeveloperToken } from '../lib/apple-developer-token.mjs'

const TTL_SECONDS = 12 * 3600
/** Reuse a minted token until it has an hour left. */
let cached = null

const json = (status, body, extra = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...extra },
  })

export default async function handler(req) {
  if (req.method !== 'GET') return json(405, { error: 'method-not-allowed' })

  const config = configFromEnv(process.env)
  if (!config) return json(200, { configured: false }, { 'cache-control': 'private, max-age=300' })

  const now = Date.now()
  if (!cached || cached.expiresAt - now < 3600_000) {
    try {
      cached = {
        token: mintDeveloperToken({ ...config, now, ttlSeconds: TTL_SECONDS }),
        expiresAt: now + TTL_SECONDS * 1000,
      }
    } catch (err) {
      // A malformed key is an operator error; say so without leaking it.
      console.error('[apple-music-token] could not sign developer token:', err?.message)
      return json(500, { error: 'apple-music-key-invalid' })
    }
  }
  // The token is meant for the page (MusicKit sends it from the browser), so
  // caching it is fine; `private` keeps shared caches from pinning a stale one.
  return json(200, { configured: true, token: cached.token }, { 'cache-control': 'private, max-age=1800' })
}
