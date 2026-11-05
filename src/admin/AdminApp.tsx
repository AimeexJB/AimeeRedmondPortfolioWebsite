import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Site } from '../Site'
import type { SiteContent } from '../types/content'
import { api, ApiError, type StorageMode } from './api'
import { ImageUploadsContext } from './imageUploads'
import type { PreparedImage } from './images'
import { SectionForm } from './SectionForms'
import { sections, type SectionKey } from './sections'

type Upload = PreparedImage & { sent: boolean }

type Status = { kind: 'info' | 'success' | 'error'; message: string; details?: string[]; link?: string; conflict?: boolean }

// Swap any image picked this session for its in-memory preview, so the live
// preview can show it before it exists on the server.
function withPreviewImages(content: SiteContent, uploads: Record<string, Upload>): SiteContent {
  const swap = (path: string | null) => (path && uploads[path] ? uploads[path].dataUrl : path)
  return {
    ...content,
    hero: { ...content.hero, portraitImage: swap(content.hero.portraitImage) },
    work: { ...content.work, projects: content.work.projects.map((project) => ({ ...project, image: swap(project.image) })) },
  }
}

function referencedImages(content: SiteContent): Set<string> {
  return new Set([content.hero.portraitImage, ...content.work.projects.map((project) => project.image)].filter((path): path is string => !!path))
}

function LoginForm({ onLogin }: { onLogin: (mode: StorageMode) => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      onLogin((await api.login(password)).mode)
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Couldn’t reach the server.')
      setBusy(false)
    }
  }

  return <main className="cms-login">
    <form onSubmit={submit}>
      <p className="eyebrow">Portfolio CMS</p>
      <h1>Welcome back.</h1>
      <div className="cms-field">
        <label htmlFor="cms-password">Password</label>
        <input id="cms-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} autoFocus required/>
      </div>
      {error && <p className="cms-status cms-status--error" role="alert">{error}</p>}
      <button className="cms-button" type="submit" disabled={busy || !password}>{busy ? 'Checking…' : 'Log in'}</button>
    </form>
  </main>
}

export function AdminApp() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [mode, setMode] = useState<StorageMode>('local')
  const [saved, setSaved] = useState<SiteContent | null>(null)
  const [draft, setDraft] = useState<SiteContent | null>(null)
  const [version, setVersion] = useState('')
  const [uploads, setUploads] = useState<Record<string, Upload>>({})
  const [section, setSection] = useState<SectionKey>('hero')
  const [previewing, setPreviewing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<Status | null>(null)

  const dirty = useMemo(() => !!draft && JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved])

  const load = useCallback(async () => {
    try {
      const result = await api.load()
      setSaved(result.content)
      setDraft(result.content)
      setVersion(result.version)
      setMode(result.mode)
      setStatus(null)
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) setAuthenticated(false)
      else setStatus({ kind: 'error', message: caught instanceof Error ? caught.message : 'Couldn’t load your content.' })
    }
  }, [])

  useEffect(() => {
    api.session()
      .then((session) => {
        setMode(session.mode)
        setAuthenticated(session.authenticated)
        if (session.authenticated) void load()
      })
      .catch((caught) => { setAuthenticated(false); setStatus({ kind: 'error', message: caught instanceof Error ? caught.message : 'Couldn’t reach the server.' }) })
  }, [load])

  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const imageUploads = useMemo(() => ({
    previewUrl: (path: string) => uploads[path]?.dataUrl ?? path,
    add: (image: PreparedImage) => setUploads((current) => ({ ...current, [image.path]: { ...image, sent: false } })),
  }), [uploads])

  async function save() {
    if (!draft) return
    setSaving(true)
    setStatus({ kind: 'info', message: 'Saving…' })
    const used = referencedImages(draft)
    const toSend = Object.values(uploads).filter((upload) => !upload.sent && used.has(upload.path))
    try {
      const result = await api.save(draft, version, toSend.map(({ path, base64 }) => ({ path, data: base64 })))
      setSaved(draft)
      setVersion(result.version)
      setUploads((current) => Object.fromEntries(Object.entries(current).map(([path, upload]) => [path, toSend.includes(upload) ? { ...upload, sent: true } : upload])))
      setStatus(result.mode === 'github'
        ? { kind: 'success', message: 'Saved. Your live site will update in about a minute.', link: result.commitUrl }
        : { kind: 'success', message: 'Saved to src/content/site.json on this computer. The live site is unchanged.' })
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) {
        setAuthenticated(false)
        setStatus({ kind: 'error', message: 'Your session expired. Log in again, then save; your changes are still here.' })
      } else if (caught instanceof ApiError) {
        setStatus({ kind: 'error', message: caught.message, details: caught.details, conflict: caught.status === 409 })
      } else {
        setStatus({ kind: 'error', message: 'Couldn’t reach the server. Your changes are still here; try again.' })
      }
    } finally {
      setSaving(false)
    }
  }

  async function logout() {
    if (dirty && !window.confirm('You have unsaved changes. Log out anyway?')) return
    await api.logout().catch(() => {})
    setDraft(null)
    setSaved(null)
    setAuthenticated(false)
  }

  if (authenticated === null) return <main className="cms-login"><p>Loading…</p></main>
  if (!authenticated) return <>
    {status && <p className={`cms-status cms-status--${status.kind} cms-status--floating`} role="alert">{status.message}</p>}
    <LoginForm onLogin={(nextMode) => {
      setMode(nextMode)
      setAuthenticated(true)
      setStatus(null)
      // If the session expired mid-edit, keep the draft rather than reloading over it.
      if (!draft) void load()
    }}/>
  </>
  if (!draft) return <main className="cms-login">{status ? <p className="cms-status cms-status--error" role="alert">{status.message}</p> : <p>Loading your content…</p>}</main>

  const current = sections.find((entry) => entry.key === section)!

  if (previewing) return <>
    <div className="cms-preview-bar">
      <span>Preview{dirty && ' · unsaved changes'}</span>
      <button className="cms-button" type="button" onClick={() => setPreviewing(false)}>Back to editing</button>
    </div>
    <Site content={withPreviewImages(draft, uploads)}/>
  </>

  return <ImageUploadsContext.Provider value={imageUploads}>
    <div className="cms">
      <header className="cms-topbar">
        <div>
          <p className="eyebrow">Portfolio CMS</p>
          <p className="cms-topbar__mode">{mode === 'github' ? 'Saving publishes to your live site' : 'Local mode · saves stay on this computer'}</p>
        </div>
        <div className="cms-topbar__actions">
          <button className="cms-button cms-button--ghost" type="button" onClick={() => { window.scrollTo(0, 0); setPreviewing(true) }}>Preview</button>
          {dirty && <button className="cms-button cms-button--ghost" type="button" onClick={() => { setDraft(saved); setStatus(null) }}>Discard changes</button>}
          <button className="cms-button" type="button" onClick={save} disabled={!dirty || saving}>{saving ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}</button>
          <button className="cms-button cms-button--link" type="button" onClick={logout}>Log out</button>
        </div>
        {status && <div className={`cms-status cms-status--${status.kind}`} role={status.kind === 'error' ? 'alert' : 'status'}>
          <button className="cms-status__close" type="button" onClick={() => setStatus(null)} aria-label="Dismiss message">✕</button>
          <p>{status.message}{status.link && <> <a href={status.link} target="_blank" rel="noreferrer">View the change on GitHub</a></>}</p>
          {status.details && <ul>{status.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>}
          {status.conflict && <button className="cms-button cms-button--ghost" type="button" onClick={() => { if (window.confirm('Load the latest content? Your unsaved changes here will be lost.')) void load() }}>Load latest</button>}
        </div>}
      </header>

      <div className="cms-layout">
        <nav className="cms-nav" aria-label="Sections">
          {sections.map((entry) => <button key={entry.key} type="button" aria-current={entry.key === section ? 'page' : undefined} onClick={() => setSection(entry.key)}>{entry.label}</button>)}
          <a className="cms-nav__view" href="/" target="_blank" rel="noreferrer">View site ↗</a>
        </nav>
        <main className="cms-form">
          <h1>{current.label}</h1>
          <p className="cms-lede">{current.description}</p>
          <SectionForm section={section} content={draft} onChange={setDraft}/>
        </main>
      </div>
    </div>
  </ImageUploadsContext.Provider>
}
