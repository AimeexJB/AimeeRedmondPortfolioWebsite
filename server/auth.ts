import { createHmac, timingSafeEqual } from 'node:crypto'

const SESSION_HOURS = 8
export const SESSION_COOKIE = 'cms_session'

function sign(secret: string, value: string): Buffer {
  return createHmac('sha256', secret).update(value).digest()
}

// Hash both sides first so the comparison takes the same time whatever the
// password's length, then compare in constant time.
export function passwordMatches(attempt: string, password: string, secret: string): boolean {
  return timingSafeEqual(sign(secret, `password.${attempt}`), sign(secret, `password.${password}`))
}

// A session is just an expiry time plus a signature over it. The password is
// part of what's signed, so changing ADMIN_PASSWORD logs every session out.
export function createSessionToken(password: string, secret: string, now = Date.now()): string {
  const expires = String(now + SESSION_HOURS * 60 * 60 * 1000)
  return `${expires}.${sign(secret, `session.${expires}.${password}`).toString('base64url')}`
}

export function isValidSessionToken(token: string | undefined, password: string, secret: string, now = Date.now()): boolean {
  if (!token) return false
  const [expires, signature] = token.split('.')
  if (!expires || !signature || !/^\d+$/.test(expires) || Number(expires) < now) return false
  const expected = sign(secret, `session.${expires}.${password}`)
  const actual = Buffer.from(signature, 'base64url')
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

export function sessionCookie(token: string, secure: boolean): string {
  return `${SESSION_COOKIE}=${token}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=${SESSION_HOURS * 60 * 60}${secure ? '; Secure' : ''}`
}

export function clearedSessionCookie(secure: boolean): string {
  return `${SESSION_COOKIE}=; Path=/api; HttpOnly; SameSite=Strict; Max-Age=0${secure ? '; Secure' : ''}`
}

export function readCookie(header: string | null, name: string): string | undefined {
  for (const part of header?.split(';') ?? []) {
    const [key, ...rest] = part.trim().split('=')
    if (key === name) return rest.join('=')
  }
}
