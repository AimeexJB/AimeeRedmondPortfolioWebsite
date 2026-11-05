import type { SiteContent } from '../../types/content'
import type { Project } from '../../types/project'
import { safeHttpUrl } from '../../utils/url'
import { Icon } from '../ui/Icon'
import { RichText } from '../ui/RichText'

type WorkProps = {
  content: SiteContent['work']
  githubUrl: string
  projects: Project[]
  onSelectProject: (project: Project) => void
}

export function Work({ content, githubUrl, projects, onSelectProject }: WorkProps) {
  const repositoriesUrl = safeHttpUrl(githubUrl)

  return <section className="work section container" id="work" aria-labelledby="work-title">
    <div className="work__top">
      <div><div className="section-label">{content.label}</div><h2 id="work-title"><RichText text={content.title}/></h2></div>
      <p>{content.intro}</p>
    </div>
    <div className="projects-grid">
      {projects.map((project, index) => <article className={`project-card project-card--${index % 3}`} key={project.key}>
        <button type="button" onClick={() => onSelectProject(project)} aria-label={`View details for ${project.name}`}>
          <div className="project-card__visual">
            {project.image
              ? <img className="project-card__image" src={project.image} alt=""/>
              : <span className="project-card__monogram">{project.name.slice(0, 1).toUpperCase()}</span>}
            <span className="project-card__number">{String(index + 1).padStart(2, '0')}</span>
            <span className="project-card__arrow"><Icon name="arrow" size={19}/></span>
          </div>
          <div className="project-card__info"><p>{project.category}</p><h3>{project.name}</h3><span>View project</span></div>
        </button>
      </article>)}
    </div>
    {content.githubLinkLabel && repositoriesUrl && <a className="button button--secondary" href={`${repositoriesUrl}?tab=repositories`} target="_blank" rel="noreferrer">{content.githubLinkLabel} <Icon name="external" size={17}/></a>}
  </section>
}
