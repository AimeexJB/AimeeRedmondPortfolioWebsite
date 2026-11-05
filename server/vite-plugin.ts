import { randomBytes } from 'node:crypto'
import { readFileSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { join } from 'node:path'
import { loadEnv, type Plugin } from 'vite'
import { validateContent } from './content-schema'
import { handleCmsRequest } from './handler'
import { createLocalStorage } from './storage/local'
import { CONTENT_PATH } from './storage/types'

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

async function toRequest(req: IncomingMessage): Promise<Request> {
  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(', ') : value)
  }
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  const body = req.method === 'GET' || req.method === 'HEAD' ? undefined : Buffer.concat(chunks)
  return new Request(`http://${req.headers.host}${req.url}`, { method: req.method, headers, body })
}

async function sendResponse(response: Response, res: ServerResponse) {
  res.statusCode = response.status
  response.headers.forEach((value, key) => { if (key !== 'set-cookie') res.setHeader(key, value) })
  const cookies = response.headers.getSetCookie()
  if (cookies.length) res.setHeader('Set-Cookie', cookies)
  res.end(Buffer.from(await response.arrayBuffer()))
}

// Wires the CMS into Vite:
// - `pnpm dev` serves the /api routes, saving to the files in this folder
//   (password comes from ADMIN_PASSWORD in .env.local)
// - the page <title> and description come from the CMS content
// - the build fails early if the content file is ever invalid
export function cmsPlugin(): Plugin {
  let root = process.cwd()
  const readContent = () => JSON.parse(readFileSync(join(root, CONTENT_PATH), 'utf8'))

  return {
    name: 'portfolio-cms',
    configResolved(config) {
      root = config.root
    },
    buildStart() {
      const result = validateContent(readContent())
      if (!result.ok) this.error(`${CONTENT_PATH} is invalid:\n${result.errors.join('\n')}`)
    },
    transformIndexHtml(html, context) {
      if (context.path !== '/index.html') return html
      const { site } = readContent()
      return html
        .replace(/<title>.*<\/title>/, `<title>${escapeHtml(site.metaTitle)}</title>`)
        .replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${escapeHtml(site.metaDescription)}"`)
    },
    configureServer(server) {
      const env = loadEnv(server.config.mode, root, '')
      const options = {
        storage: createLocalStorage(root),
        password: env.ADMIN_PASSWORD,
        // Fine to regenerate locally; it just logs you out when the dev server restarts.
        sessionSecret: env.SESSION_SECRET || randomBytes(32).toString('hex'),
        secureCookies: false,
      }
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next()
        toRequest(req).then((request) => handleCmsRequest(request, options)).then((response) => sendResponse(response, res)).catch(next)
      })
    },
  }
}
