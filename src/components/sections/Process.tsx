import type { SiteContent } from '../../types/content'
import { RichText } from '../ui/RichText'

type ProcessProps = { content: SiteContent['process'] }

export function Process({ content }: ProcessProps) {
  return <section className="process section">
    <div className="container"><div className="process__inner">
      <div><div className="section-label">{content.label}</div><h2><RichText text={content.title}/></h2></div>
      <ol>{content.steps.map((step, index) => <li key={index}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{step.title}</h3><p>{step.body}</p></div></li>)}</ol>
    </div></div>
  </section>
}
