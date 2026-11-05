import { CONTENT_PATH, ConflictError, gitBlobSha, type ContentStorage } from './types'

type GitHubOptions = {
  token: string
  repo: string
  branch: string
}

// Used on Netlify: each save becomes one commit on the production branch, which
// Netlify then builds and publishes like any other push.
export function createGitHubStorage({ token, repo, branch }: GitHubOptions): ContentStorage {
  async function github<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`https://api.github.com/repos/${repo}${path}`, {
      ...init,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'portfolio-cms',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })
    if (response.status === 422 && path.startsWith('/git/refs/')) throw new ConflictError()
    if (!response.ok) throw new Error(`GitHub ${init.method ?? 'GET'} ${path} failed with ${response.status}: ${await response.text()}`)
    return response.json() as Promise<T>
  }

  async function readAt(ref: string) {
    const file = await github<{ sha: string; content: string }>(`/contents/${CONTENT_PATH}?ref=${encodeURIComponent(ref)}`)
    return { json: Buffer.from(file.content, 'base64').toString('utf8'), version: file.sha }
  }

  return {
    mode: 'github',
    read: () => readAt(branch),
    async write(json, images, baseVersion) {
      const ref = await github<{ object: { sha: string } }>(`/git/ref/heads/${branch}`)
      const head = ref.object.sha
      if ((await readAt(head)).version !== baseVersion) throw new ConflictError()

      const headCommit = await github<{ tree: { sha: string } }>(`/git/commits/${head}`)
      const imageEntries = await Promise.all(images.map(async (image) => {
        const blob = await github<{ sha: string }>('/git/blobs', { method: 'POST', body: JSON.stringify({ content: image.bytes.toString('base64'), encoding: 'base64' }) })
        return { path: `public${image.path}`, mode: '100644', type: 'blob', sha: blob.sha }
      }))
      const tree = await github<{ sha: string }>('/git/trees', {
        method: 'POST',
        body: JSON.stringify({ base_tree: headCommit.tree.sha, tree: [...imageEntries, { path: CONTENT_PATH, mode: '100644', type: 'blob', content: json }] }),
      })
      const commit = await github<{ sha: string; html_url: string }>('/git/commits', {
        method: 'POST',
        body: JSON.stringify({ message: 'Update site content from the CMS', tree: tree.sha, parents: [head] }),
      })
      // Not forced: if someone pushed in the meantime GitHub refuses (422), which
      // becomes a ConflictError instead of overwriting their work.
      await github(`/git/refs/heads/${branch}`, { method: 'PATCH', body: JSON.stringify({ sha: commit.sha, force: false }) })

      return { version: gitBlobSha(json), commitUrl: commit.html_url }
    },
  }
}
