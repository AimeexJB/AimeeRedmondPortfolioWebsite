import type { RefObject } from 'react'
import type { SiteContent } from '../../types/content'
import { Icon } from '../ui/Icon'
import { RichText } from '../ui/RichText'

type ContactProps = {
  content: SiteContent['contact']
  name: string
  sectionRef: RefObject<HTMLElement | null>
}

export function Contact({ content, name, sectionRef }: ContactProps) {
  return <section className="contact section container" id="contact" aria-labelledby="contact-title" ref={sectionRef}>
    <div className="contact__top"><div className="section-label">{content.label}</div><p>{content.intro}</p></div>
    <h2 id="contact-title"><RichText text={content.title}/></h2>
    <a className="email-link" href={`mailto:${content.email}`}>{content.email} <Icon name="arrow" size={24}/></a>
    <div className="contact__bottom"><p>© {new Date().getFullYear()} {name}</p><a href="#top">Back to top ↑</a></div>
  </section>
}
