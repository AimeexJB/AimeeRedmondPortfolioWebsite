import { createHash } from 'node:crypto'

// Where the CMS reads and writes content. Locally that's the files in this
// folder; on Netlify it's commits to the GitHub repo.

export const CONTENT_PATH = 'src/content/site.json'

export type ImageUpload = {
  // Public path, e.g. /uploads/my-photo-a1b2c3.webp (saved under public/)
  path: string
  bytes: Buffer
}

export type SaveResult = {
  version: string
  commitUrl?: string
}

export interface ContentStorage {
  // Shown in the editor so it's clear where a save goes.
  mode: 'local' | 'github'
  read(): Promise<{ json: string; version: string }>
  // Fails with ConflictError if the content changed since `baseVersion` was read.
  write(json: string, images: ImageUpload[], baseVersion: string): Promise<SaveResult>
}

export class ConflictError extends Error {}

// The same ID git gives the file, so local and GitHub versions compare the same way.
export function gitBlobSha(text: string): string {
  const body = Buffer.from(text)
  return createHash('sha1').update(`blob ${body.length}\0`).update(body).digest('hex')
}
