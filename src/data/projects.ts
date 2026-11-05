import type { CmsProject } from '../types/content'
import type { Project, Repo } from '../types/project'

export function projectFromCms(project: CmsProject): Project {
  return {
    key: `cms-${project.id}`,
    name: project.name,
    category: project.category || 'Web project',
    description: project.description,
    tags: project.tags,
    image: project.image,
    codeUrl: project.codeUrl || null,
    liveUrl: project.liveUrl || null,
    source: 'cms',
  }
}

export function projectFromRepo(repo: Repo): Project {
  return {
    key: `github-${repo.id}`,
    name: repo.name.replace(/[-_]/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2'),
    category: repo.language || 'Web project',
    description: repo.description || 'An in-progress project from my GitHub portfolio. Explore the repository for the latest work and documentation.',
    tags: repo.topics ?? [],
    image: null,
    codeUrl: repo.html_url,
    liveUrl: repo.homepage,
    source: 'github',
  }
}
