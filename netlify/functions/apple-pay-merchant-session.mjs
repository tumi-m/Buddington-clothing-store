// POST /.netlify/functions/apple-pay-merchant-session → merchant session JSON
//
// Safari hands the page a one-time `validationURL` when the Apple Pay sheet
// opens. Only a server holding the Merchant Identity Certificate can answer it,
// so the page relays it here. A store with no Apple Pay credentials gets
// `{ configured: false }` as a normal 200 — the button is simply never offered.

import { configFromEnv, requestMerchantSession } from '../lib/apple-pay-merchant.mjs'

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })

export default async function handler(req) {
  if (req.method !== 'POST') return json(405, { error: 'method-not-allowed' })

  const config = configFromEnv(process.env)
  if (!config) return json(200, { configured: false })

  let body
  try {
    body = await req.json()
  } catch {
    return json(400, { error: 'invalid-json' })
  }

  const validationURL = typeof body?.validationURL === 'string' ? body.validationURL : ''
  if (!validationURL) return json(400, { error: 'missing-validation-url' })

  // Bind the session to the host actually serving the page rather than to a
  // value the client supplies, so it cannot ask for a session for a domain the
  // merchant has not registered.
  const domain = new URL(req.url).hostname

  try {
    const session = await requestMerchantSession({ config, validationURL, domain })
    return json(200, { configured: true, session })
  } catch (err) {
    // Operator-facing detail stays in the log; the browser gets a short code.
    console.error('[apple-pay] merchant validation failed:', err?.message)
    const code = err?.message === 'invalid-validation-url' ? 'invalid-validation-url' : 'validation-failed'
    return json(code === 'invalid-validation-url' ? 400 : 502, { error: code })
  }
}
