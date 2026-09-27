// Apple Pay merchant validation.
//
// When a shopper taps the Apple Pay button, Safari asks the page to prove the
// merchant is who it says. The page cannot do that: proving it needs the
// Merchant Identity Certificate, which must never reach the browser. So the
// page forwards Apple's `validationURL` here, and this module performs the
// mutual-TLS handshake with that certificate and returns the opaque merchant
// session Safari expects.

import { request } from 'node:https'

/**
 * Read Apple Pay configuration from the environment.
 * Returns null when the store has not been set up, which callers treat as a
 * normal "not configured" answer rather than an error.
 */
export function configFromEnv(env = process.env) {
  const merchantId = env.APPLE_PAY_MERCHANT_ID
  const cert = env.APPLE_PAY_MERCHANT_CERT
  const key = env.APPLE_PAY_MERCHANT_KEY
  if (!merchantId || !cert || !key) return null
  return {
    merchantId,
    cert: cert.replace(/\\n/g, '\n'),
    key: key.replace(/\\n/g, '\n'),
    keyPassphrase: env.APPLE_PAY_MERCHANT_KEY_PASSPHRASE || undefined,
    displayName: env.APPLE_PAY_DISPLAY_NAME || 'Buddington',
  }
}

/**
 * Apple sends the validation URL to the page, and the page sends it here — so
 * it is attacker-influenced input. Without this check a crafted URL would make
 * the server open a mutual-TLS connection, presenting the merchant
 * certificate, to a host of someone else's choosing. Only Apple's own hosts
 * over HTTPS are allowed.
 */
export function isAppleValidationUrl(value) {
  let url
  try {
    url = new URL(value)
  } catch {
    return false
  }
  if (url.protocol !== 'https:') return false
  const host = url.hostname.toLowerCase()
  return host === 'apple.com' || host.endsWith('.apple.com')
}

/**
 * Perform the mutual-TLS POST to Apple and return the parsed merchant session.
 * `domain` must be the fully-qualified domain the page is served from and must
 * match the one registered with Apple, or validation is rejected.
 */
export function requestMerchantSession({ config, validationURL, domain, fetchImpl }) {
  if (!isAppleValidationUrl(validationURL)) {
    return Promise.reject(new Error('invalid-validation-url'))
  }

  const payload = JSON.stringify({
    merchantIdentifier: config.merchantId,
    displayName: config.displayName,
    initiative: 'web',
    initiativeContext: domain,
  })

  // Injectable for tests; production uses the mutual-TLS https request below.
  if (fetchImpl) return fetchImpl(validationURL, payload)

  const url = new URL(validationURL)
  return new Promise((resolve, reject) => {
    const req = request(
      {
        method: 'POST',
        host: url.hostname,
        path: url.pathname + url.search,
        port: url.port || 443,
        cert: config.cert,
        key: config.key,
        passphrase: config.keyPassphrase,
        headers: {
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(payload),
        },
        timeout: 12_000,
      },
      res => {
        let body = ''
        res.setEncoding('utf8')
        res.on('data', chunk => { body += chunk })
        res.on('end', () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(`apple-responded-${res.statusCode}`))
            return
          }
          try {
            resolve(JSON.parse(body))
          } catch {
            reject(new Error('apple-response-not-json'))
          }
        })
      },
    )
    req.on('timeout', () => req.destroy(new Error('apple-validation-timeout')))
    req.on('error', reject)
    req.end(payload)
  })
}
