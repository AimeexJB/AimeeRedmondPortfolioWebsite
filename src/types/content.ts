// Everything the CMS can edit lives in src/content/site.json and has this shape.
// Headings use a tiny markup: `*words*` become <em>, and a new line becomes <br/>.

export type TextItem = {
  title: string
  body: string
}

export type CmsProject = {
  id: string
  name: string
  category: string
  description: string
  tags: string[]
  image: string | null
  codeUrl: string
  liveUrl: string
}

export type SiteContent = {
  site: {
    name: string
    metaTitle: string
    metaDescription: string
    githubUsername: string
    githubUrl: string
  }
  hero: {
    eyebrow: string
    title: string
    intro: string
    ctaLabel: string
    portraitImage: string | null
    portraitLetter: string
    portraitTagline: string
    location: string
    availability: string
  }
  about: {
    label: string
    title: string
    paragraphs: string[]
    ctaLabel: string
  }
  skills: {
    label: string
    title: string
    items: TextItem[]
  }
  work: {
    label: string
    title: string
    intro: string
    projects: CmsProject[]
    showGithubFeed: boolean
    githubLimit: number
    githubLinkLabel: string
  }
  process: {
    label: string
    title: string
    steps: TextItem[]
  }
  contact: {
    label: string
    intro: string
    title: string
    email: string
  }
}
