import type { SiteContent } from '../src/types/content'

// Checks that a value is a complete, well-formed SiteContent before it's saved
// or built. Everything the CMS sends goes through here, so a bad request can't
// put broken links, script URLs or unexpected fields into the site.

type Check = (value: unknown, path: string, errors: string[]) => void

export const IMAGE_PATH = /^\/uploads\/[a-z0-9][a-z0-9-]{0,80}\.webp$/

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function text(max: number, { required = true } = {}): Check {
  return (value, path, errors) => {
    if (typeof value !== 'string') return void errors.push(`${path} must be text`)
    if (required && !value.trim()) errors.push(`${path} can't be empty`)
    if (value.length > max) errors.push(`${path} must be ${max} characters or fewer`)
  }
}

function link({ required = false } = {}): Check {
  return (value, path, errors) => {
    if (typeof value !== 'string') return void errors.push(`${path} must be text`)
    if (!value) return void (required && errors.push(`${path} can't be empty`))
    try {
      const url = new URL(value)
      if (url.protocol !== 'https:' && url.protocol !== 'http:') errors.push(`${path} must start with https://`)
    } catch {
      errors.push(`${path} must be a full link, starting with https://`)
    }
  }
}

const email: Check = (value, path, errors) => {
  if (typeof value !== 'string' || !/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(value)) errors.push(`${path} must be an email address`)
}

const image: Check = (value, path, errors) => {
  if (value !== null && (typeof value !== 'string' || !IMAGE_PATH.test(value))) errors.push(`${path} must be an uploaded image`)
}

const bool: Check = (value, path, errors) => {
  if (typeof value !== 'boolean') errors.push(`${path} must be on or off`)
}

function whole(min: number, max: number): Check {
  return (value, path, errors) => {
    if (!Number.isInteger(value) || (value as number) < min || (value as number) > max) errors.push(`${path} must be a whole number from ${min} to ${max}`)
  }
}

function list(item: Check, max: number): Check {
  return (value, path, errors) => {
    if (!Array.isArray(value)) return void errors.push(`${path} must be a list`)
    if (value.length > max) errors.push(`${path} can have at most ${max} entries`)
    value.forEach((entry, index) => item(entry, `${path}[${index + 1}]`, errors))
  }
}

// The mapped type makes TypeScript complain if a field is added to SiteContent
// without a matching check here (or vice versa).
function object<T>(shape: { [K in keyof T]-?: Check }): Check {
  return (value, path, errors) => {
    if (!isRecord(value)) return void errors.push(`${path} must be an object`)
    for (const key of Object.keys(value)) if (!(key in shape)) errors.push(`${path}.${key} isn't a known field`)
    for (const [key, check] of Object.entries(shape) as [string, Check][]) check(value[key], `${path}.${key}`, errors)
  }
}

const textItem = object<SiteContent['skills']['items'][number]>({ title: text(80), body: text(400) })

const checkSiteContent = object<SiteContent>({
  site: object<SiteContent['site']>({
    name: text(80),
    metaTitle: text(120),
    metaDescription: text(300),
    githubUsername: text(39, { required: false }),
    githubUrl: link(),
  }),
  hero: object<SiteContent['hero']>({
    eyebrow: text(120),
    title: text(160),
    intro: text(500),
    ctaLabel: text(60),
    portraitImage: image,
    portraitLetter: text(3),
    portraitTagline: text(80, { required: false }),
    location: text(80, { required: false }),
    availability: text(80, { required: false }),
  }),
  about: object<SiteContent['about']>({
    label: text(60),
    title: text(200),
    paragraphs: list(text(1500), 8),
    ctaLabel: text(60),
  }),
  skills: object<SiteContent['skills']>({
    label: text(60),
    title: text(160),
    items: list(textItem, 12),
  }),
  work: object<SiteContent['work']>({
    label: text(60),
    title: text(160),
    intro: text(400, { required: false }),
    projects: list(object<SiteContent['work']['projects'][number]>({
      id: (value, path, errors) => { if (typeof value !== 'string' || !/^[a-z0-9-]{1,40}$/.test(value)) errors.push(`${path} is invalid`) },
      name: text(80),
      category: text(60, { required: false }),
      description: text(1500, { required: false }),
      tags: list(text(30), 8),
      image,
      codeUrl: link(),
      liveUrl: link(),
    }), 24),
    showGithubFeed: bool,
    githubLimit: whole(0, 24),
    githubLinkLabel: text(60, { required: false }),
  }),
  process: object<SiteContent['process']>({
    label: text(60),
    title: text(160),
    steps: list(textItem, 8),
  }),
  contact: object<SiteContent['contact']>({
    label: text(60),
    intro: text(300, { required: false }),
    title: text(160),
    email,
  }),
})

export function validateContent(value: unknown): { ok: true; content: SiteContent } | { ok: false; errors: string[] } {
  const errors: string[] = []
  checkSiteContent(value, 'content', errors)
  return errors.length ? { ok: false, errors } : { ok: true, content: value as SiteContent }
}
