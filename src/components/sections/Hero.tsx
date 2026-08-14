import { Icon } from '../ui/Icon'

export function Hero() {
  return <section className="hero" id="top" aria-labelledby="hero-title">
    <div className="hero__orb hero__orb--one"/>
    <div className="hero__orb hero__orb--two"/>
    <div className="hero__content container">
      <p className="eyebrow"><span/> Front-end developer &amp; problem solver</p>
      <div className="hero__grid">
        <div>
          <h1 id="hero-title">Building thoughtful<br/><em>digital experiences.</em></h1>
          <p className="hero__intro">Hi, I’m Aimee. I turn ideas into accessible, engaging websites with clarity, curiosity and a love for the small details.</p>
          <a className="button button--primary" href="#work">Explore my work <Icon name="arrow" size={18}/></a>
        </div>
        <div className="portrait-wrap" aria-label="Decorative profile illustration">
          <div className="portrait"><div className="portrait__shine"/><span>A</span><p>creative<br/>developer</p></div>
          <div className="orbit orbit--one"/><div className="orbit orbit--two"/>
          <p className="portrait-caption">Based in Tokyo<br/><b>Available for new ideas</b></p>
        </div>
      </div>
    </div>
    <a className="scroll-cue" href="#about"><span>Scroll to discover</span><i/></a>
  </section>
}
