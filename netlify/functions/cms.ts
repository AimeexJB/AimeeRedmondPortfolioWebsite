import { handleCmsRequest } from '../../server/handler'
import { createGitHubStorage } from '../../server/storage/github'

// Production CMS API. Set these in Netlify → Project configuration → Environment variables:
//   ADMIN_PASSWORD   the password for /admin
//   SESSION_SECRET   a long random string used to sign logins
//   GITHUB_TOKEN     fine-grained token with Contents: read & write on this repo only
//   GITHUB_REPO      optional, defaults to AimeexJB/AimeeRedmondPortfolioWebsite
//   GITHUB_BRANCH    optional, defaults to main
export default async (request: Request) => {
  const token = process.env.GITHUB_TOKEN
  if (!token) return Response.json({ error: 'The CMS isn’t set up yet: GITHUB_TOKEN needs to be set.' }, { status: 503 })

  return handleCmsRequest(request, {
    storage: createGitHubStorage({
      token,
      repo: process.env.GITHUB_REPO || 'AimeexJB/AimeeRedmondPortfolioWebsite',
      branch: process.env.GITHUB_BRANCH || 'main',
    }),
    password: process.env.ADMIN_PASSWORD,
    sessionSecret: process.env.SESSION_SECRET,
    secureCookies: true,
  })
}

export const config = { path: '/api/*' }
