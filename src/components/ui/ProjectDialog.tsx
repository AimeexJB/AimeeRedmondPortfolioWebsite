import type { RefObject } from 'react'
import type { Project } from '../../types/project'
import { safeHttpUrl } from '../../utils/url'
import { Icon } from './Icon'

type ProjectDialogProps = {
  dialogRef: RefObject<HTMLDialogElement | null>
  project: Project | null
  onClose: () => void
}

export function ProjectDialog({ dialogRef, project, onClose }: ProjectDialogProps) {
  const codeUrl = safeHttpUrl(project?.codeUrl)
  const liveUrl = safeHttpUrl(project?.liveUrl)

  return <dialog className="project-dialog" ref={dialogRef} aria-labelledby="dialog-title" onClose={onClose}>
    {project && <div className={`dialog-content${project.image ? ' dialog-content--image' : ''}`}>
      <button className="dialog-close" type="button" onClick={onClose}><Icon name="close"/><span className="sr-only">Close project details</span></button>
      <div className="dialog-art">
        {project.image ? <img src={project.image} alt=""/> : <span>{project.name.slice(0, 1).toUpperCase()}</span>}
      </div>
      <div className="dialog-copy">
        <p className="eyebrow">{project.category}{project.source === 'github' && ' · GitHub repository'}</p>
        <h2 id="dialog-title">{project.name}</h2>
        <p>{project.description}</p>
        {project.tags.length ? <ul className="tags">{project.tags.slice(0, 4).map((tag) => <li key={tag}>{tag}</li>)}</ul> : null}
        <div className="dialog-actions">
          {codeUrl && <a className="button button--primary" href={codeUrl} target="_blank" rel="noreferrer">View code <Icon name="github" size={17}/></a>}
          {liveUrl && <a className="text-link" href={liveUrl} target="_blank" rel="noreferrer">Visit live site <Icon name="external" size={17}/></a>}
        </div>
      </div>
    </div>}
  </dialog>
}
