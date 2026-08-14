import { skills } from '../../data/content'

export function Skills() {
  return <section className="skills section" id="skills" aria-labelledby="skills-title">
    <div className="container">
      <div className="section-heading"><div className="section-label">02 / Expertise</div><h2 id="skills-title">The good stuff<br/><em>I bring to the table.</em></h2></div>
      <div className="skills-grid">
        {skills.map(([number, title, body]) => <article className="skill" key={number}><span>{number}</span><h3>{title}</h3><p>{body}</p><div className="skill__line"/></article>)}
      </div>
    </div>
  </section>
}
