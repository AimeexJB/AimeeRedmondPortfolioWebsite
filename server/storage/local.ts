import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { CONTENT_PATH, ConflictError, gitBlobSha, type ContentStorage } from './types'

// Used by `pnpm dev`: saves go straight to the files in this folder, so you can
// try everything out without touching GitHub or the live site.
export function createLocalStorage(root: string): ContentStorage {
  const contentFile = join(root, CONTENT_PATH)

  return {
    mode: 'local',
    async read() {
      const json = await readFile(contentFile, 'utf8')
      return { json, version: gitBlobSha(json) }
    },
    async write(json, images, baseVersion) {
      if (gitBlobSha(await readFile(contentFile, 'utf8')) !== baseVersion) throw new ConflictError()
      for (const image of images) {
        const file = join(root, 'public', image.path)
        await mkdir(dirname(file), { recursive: true })
        await writeFile(file, image.bytes)
      }
      await writeFile(contentFile, json)
      return { version: gitBlobSha(json) }
    },
  }
}
