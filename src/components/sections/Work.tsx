import type { Repo } from '../../types/project'
import { Icon } from '../ui/Icon'

type WorkProps = {
  projects: Repo[]
  onSelectProject: (project: Repo) => void
}

export function Work({ projects, onSelectProject }: WorkProps) {
  return <section className="work section container" id="work" aria-labelledby="work-title">
    <div className="work__top">
      <div><div className="section-label">03 / Selected work</div><h2 id="work-title">Things I’ve<br/><em>made &amp; learned from.</em></h2></div>
      <p>These projects are pulled directly from GitHub, so this space grows right alongside my work.</p>
    </div>
    <div className="projects-grid">
      {projects.map((project, index) => <article className={`project-card project-card--${index % 3}`} key={project.id}>
        <button type="button" onClick={() => onSelectProject(project)} aria-label={`View details for ${project.name}`}>
          <div className="project-card__visual"><span className="project-card__number">0{index + 1}</span><span className="project-card__monogram">{project.name.slice(0, 1).toUpperCase()}</span><span className="project-card__arrow"><Icon name="arrow" size={19}/></span></div>
          <div className="project-card__info"><p>{project.language || 'Web project'}</p><h3>{project.name.replace(/[-_]/g, ' ').replace(/([A-Z])/g, ' $1')}</h3><span>View project</span></div>
        </button>
      </article>)}
    </div>
    <a className="button button--secondary" href="https://github.com/AimeexJB?tab=repositories" target="_blank" rel="noreferrer">View all on GitHub <Icon name="external" size={17}/></a>
  </section>
}
