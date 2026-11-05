import { clearedSessionCookie, createSessionToken, isValidSessionToken, passwordMatches, readCookie, SESSION_COOKIE, sessionCookie } from './auth'
import { IMAGE_PATH, validateContent } from './content-schema'
import { ConflictError, type ContentStorage, type ImageUpload } from './storage/types'

// The CMS API. The same handler runs in two places: the Netlify Function in
// production and the Vite dev server locally; only the storage differs.
//
//   GET  /api/session   → { authenticated, mode }
//   POST /api/login     → { password }   sets the session cookie
//   POST /api/logout
//   GET  /api/content   → { content, version, mode }
//   PUT  /api/content   → { content, baseVersion, images: [{ path, data }] }

export type CmsOptions = {
  storage: ContentStorage
  password: string | undefined
  sessionSecret: string | undefined
  secureCookies: boolean
}

const MAX_BODY_BYTES = 5_500_000
const MAX_IMAGE_BYTES = 2_000_000
const MAX_IMAGES_PER_SAVE = 10

function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers } })
}

function error(message: string, status: number, details?: string[]): Response {
  return json({ error: message, details }, status)
}

async function readJsonBody(request: Request): Promise<unknown> {
  const body = await request.text()
  if (body.length > MAX_BODY_BYTES) throw new RangeError()
  return JSON.parse(body)
}

function isWebp(bytes: Buffer): boolean {
  return bytes.length > 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP'
}

function parseImages(value: unknown): ImageUpload[] | string {
  if (!Array.isArray(value)) return 'images must be a list'
  if (value.length > MAX_IMAGES_PER_SAVE) return `You can upload at most ${MAX_IMAGES_PER_SAVE} images per save`
  const images: ImageUpload[] = []
  for (const entry of value) {
    if (typeof entry?.path !== 'string' || !IMAGE_PATH.test(entry.path) || typeof entry.data !== 'string') return 'An uploaded image is invalid'
    const bytes = Buffer.from(entry.data, 'base64')
    if (bytes.length > MAX_IMAGE_BYTES) return 'An uploaded image is too large'
    if (!isWebp(bytes)) return 'Uploaded images must be WebP'
    images.push({ path: entry.path, bytes })
  }
  return images
}

export async function handleCmsRequest(request: Request, { storage, password, sessionSecret, secureCookies }: CmsOptions): Promise<Response> {
  const url = new URL(request.url)
  const route = `${request.method} ${url.pathname.replace(/\/$/, '')}`

  if (!password || !sessionSecret || sessionSecret.length < 32) {
    return error('The CMS isn’t set up yet: ADMIN_PASSWORD and SESSION_SECRET (32+ characters) need to be set.', 503)
  }

  if (request.method !== 'GET') {
    // Only accept JSON from this site's own pages. Together with the SameSite
    // cookie this stops another website from submitting requests on your behalf.
    const origin = request.headers.get('Origin')
    if ((origin && origin !== url.origin) || !request.headers.get('Content-Type')?.startsWith('application/json')) {
      return error('Request not allowed', 403)
    }
  }

  const authenticated = isValidSessionToken(readCookie(request.headers.get('Cookie'), SESSION_COOKIE), password, sessionSecret)

  try {
    switch (route) {
      case 'GET /api/session':
        return json({ authenticated, mode: storage.mode })

      case 'POST /api/login': {
        const body = await readJsonBody(request) as { password?: unknown }
        if (typeof body?.password !== 'string' || !passwordMatches(body.password, password, sessionSecret)) {
          // Slow down guessing a little; Functions keep no state to do proper rate limiting.
          await new Promise((resolve) => setTimeout(resolve, 1000))
          return error('That password isn’t right', 401)
        }
        return json({ authenticated: true, mode: storage.mode }, 200, { 'Set-Cookie': sessionCookie(createSessionToken(password, sessionSecret), secureCookies) })
      }

      case 'POST /api/logout':
        return json({ authenticated: false }, 200, { 'Set-Cookie': clearedSessionCookie(secureCookies) })

      case 'GET /api/content': {
        if (!authenticated) return error('Please log in', 401)
        const { json: text, version } = await storage.read()
        return json({ content: JSON.parse(text), version, mode: storage.mode })
      }

      case 'PUT /api/content': {
        if (!authenticated) return error('Please log in', 401)
        const body = await readJsonBody(request) as { content?: unknown; baseVersion?: unknown; images?: unknown }
        const result = validateContent(body?.content)
        if (!result.ok) return error('Some fields need fixing before you can save', 422, result.errors.map((detail) => detail.replace(/^content\./, '')))
        if (typeof body.baseVersion !== 'string') return error('Missing baseVersion', 400)
        const images = parseImages(body.images ?? [])
        if (typeof images === 'string') return error(images, 422)

        const saved = await storage.write(`${JSON.stringify(result.content, null, 2)}\n`, images, body.baseVersion)
        return json({ ...saved, mode: storage.mode })
      }

      default:
        return error('Not found', 404)
    }
  } catch (caught) {
    if (caught instanceof ConflictError) return error('The content changed somewhere else since you opened the editor.', 409)
    if (caught instanceof RangeError) return error('That save is too large. Try uploading fewer images at once.', 413)
    if (caught instanceof SyntaxError) return error('Invalid JSON', 400)
    console.error('CMS request failed:', caught)
    return error('Something went wrong saving. Nothing was changed.', 500)
  }
}
