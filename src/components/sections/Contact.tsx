import type { RefObject } from 'react'
import { Icon } from '../ui/Icon'

type ContactProps = { sectionRef: RefObject<HTMLElement | null> }

export function Contact({ sectionRef }: ContactProps) {
  return <section className="contact section container" id="contact" aria-labelledby="contact-title" ref={sectionRef}>
    <div className="contact__top"><div className="section-label">05 / Contact</div><p>Have an opportunity, an idea, or simply fancy a chat?</p></div>
    <h2 id="contact-title">Let’s make something<br/><em>worth using.</em></h2>
    <a className="email-link" href="mailto:hello@aimeeredmond.com">hello@aimeeredmond.com <Icon name="arrow" size={24}/></a>
    <div className="contact__bottom"><p>© {new Date().getFullYear()} Aimee Redmond</p><a href="#top">Back to top ↑</a></div>
  </section>
}
