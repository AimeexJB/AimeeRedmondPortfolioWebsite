import type { SiteContent } from '../../types/content'
import { Icon } from '../ui/Icon'
import { RichText } from '../ui/RichText'

type AboutProps = { content: SiteContent['about'] }

export function About({ content }: AboutProps) {
  return <section className="about section container" id="about" aria-labelledby="about-title">
    <div className="section-label">{content.label}</div>
    <div className="about__content">
      <h2 id="about-title"><RichText text={content.title}/></h2>
      <div>
        {content.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        <a className="text-link" href="#contact">{content.ctaLabel} <Icon name="arrow" size={17}/></a>
      </div>
    </div>
  </section>
}
