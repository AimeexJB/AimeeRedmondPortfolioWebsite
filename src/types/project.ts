export type Repo = {
  id: number
  name: string
  description: string | null
  html_url: string
  homepage: string | null
  language: string | null
  topics?: string[]
  updated_at: string
  stargazers_count: number
  fork: boolean
}

// What the Work cards and project dialog render, whether a project was written
// in the CMS or pulled from the GitHub feed.
export type Project = {
  key: string
  name: string
  category: string
  description: string
  tags: string[]
  image: string | null
  codeUrl: string | null
  liveUrl: string | null
  source: 'cms' | 'github'
}
