import type { RefObject } from 'react'
import type { Repo } from '../../types/project'
import { Icon } from './Icon'

type ProjectDialogProps = {
  dialogRef: RefObject<HTMLDialogElement | null>
  project: Repo | null
  onClose: () => void
}

// Only allow http(s) links. Blocks things like `javascript:` URLs from ever
// reaching an href, even if a repo's homepage field contained one.
function safeHttpUrl(value: string | null): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null
  } catch {
    return null
  }
}

export function ProjectDialog({ dialogRef, project, onClose }: ProjectDialogProps) {
  const repoUrl = safeHttpUrl(project?.html_url ?? null)
  const homepageUrl = safeHttpUrl(project?.homepage ?? null)

  return <dialog className="project-dialog" ref={dialogRef} aria-labelledby="dialog-title" onClose={onClose}>
    {project && <div className="dialog-content">
      <button className="dialog-close" type="button" onClick={onClose}><Icon name="close"/><span className="sr-only">Close project details</span></button>
      <div className="dialog-art"><span>{project.name.slice(0, 1).toUpperCase()}</span></div>
      <div className="dialog-copy">
        <p className="eyebrow">{project.language || 'Web project'} · GitHub repository</p>
        <h2 id="dialog-title">{project.name.replace(/[-_]/g, ' ')}</h2>
        <p>{project.description || 'An in-progress project from my GitHub portfolio. Explore the repository for the latest work and documentation.'}</p>
        {project.topics?.length ? <ul className="tags">{project.topics.slice(0, 4).map((topic) => <li key={topic}>{topic}</li>)}</ul> : null}
        <div className="dialog-actions">
          {repoUrl && <a className="button button--primary" href={repoUrl} target="_blank" rel="noreferrer">View code <Icon name="github" size={17}/></a>}
          {homepageUrl && <a className="text-link" href={homepageUrl} target="_blank" rel="noreferrer">Visit live site <Icon name="external" size={17}/></a>}
        </div>
      </div>
    </div>}
  </dialog>
}
