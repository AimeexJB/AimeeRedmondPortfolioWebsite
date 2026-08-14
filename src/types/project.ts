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
