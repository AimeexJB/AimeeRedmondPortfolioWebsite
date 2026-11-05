// Only allow http(s) links. Blocks things like `javascript:` URLs from ever
// reaching an href, even if a repo's homepage field or CMS link contained one.
export function safeHttpUrl(value: string | null | undefined): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null
  } catch {
    return null
  }
}
