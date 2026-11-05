import type { SiteContent } from '../../types/content'
import { RichText } from '../ui/RichText'

type SkillsProps = { content: SiteContent['skills'] }

export function Skills({ content }: SkillsProps) {
  return <section className="skills section" id="skills" aria-labelledby="skills-title">
    <div className="container">
      <div className="section-heading"><div className="section-label">{content.label}</div><h2 id="skills-title"><RichText text={content.title}/></h2></div>
      <div className="skills-grid">
        {content.items.map((skill, index) => <article className="skill" key={index}><span>{String(index + 1).padStart(2, '0')}</span><h3>{skill.title}</h3><p>{skill.body}</p><div className="skill__line"/></article>)}
      </div>
    </div>
  </section>
}
