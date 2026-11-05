import type { SiteContent } from '../../types/content'
import { Icon } from '../ui/Icon'
import { RichText } from '../ui/RichText'

type HeroProps = {
  content: SiteContent['hero']
  name: string
}

export function Hero({ content, name }: HeroProps) {
  return <section className="hero" id="top" aria-labelledby="hero-title">
    <div className="hero__orb hero__orb--one"/>
    <div className="hero__orb hero__orb--two"/>
    <div className="hero__content container">
      <p className="eyebrow"><span/> {content.eyebrow}</p>
      <div className="hero__grid">
        <div>
          <h1 id="hero-title"><RichText text={content.title}/></h1>
          <p className="hero__intro">{content.intro}</p>
          <a className="button button--primary" href="#work">{content.ctaLabel} <Icon name="arrow" size={18}/></a>
        </div>
        <div className="portrait-wrap">
          {content.portraitImage
            ? <div className="portrait portrait--photo"><img src={content.portraitImage} alt={`Portrait of ${name}`}/></div>
            : <div className="portrait"><div className="portrait__shine"/><span>{content.portraitLetter}</span><p><RichText text={content.portraitTagline}/></p></div>}
          <div className="orbit orbit--one"/><div className="orbit orbit--two"/>
          <p className="portrait-caption">{content.location}<br/><b>{content.availability}</b></p>
        </div>
      </div>
    </div>
    <a className="scroll-cue" href="#about"><span>Scroll to discover</span><i/></a>
  </section>
}
