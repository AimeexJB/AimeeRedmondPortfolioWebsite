import { Icon } from '../ui/Icon'

export function About() {
  return <section className="about section container" id="about" aria-labelledby="about-title">
    <div className="section-label">01 / About</div>
    <div className="about__content">
      <h2 id="about-title">A developer who cares about <em>how it feels</em> to use the web.</h2>
      <div>
        <p>I’m Aimee, a front-end developer with an eye for clean interfaces and a practical, people-first approach to building them. I enjoy the space where thoughtful design and well-crafted code meet.</p>
        <p>Whether I’m shaping a responsive component system or refining a tiny interaction, I’m always asking: is this clear, useful and welcoming for everyone?</p>
        <a className="text-link" href="#contact">Let’s work together <Icon name="arrow" size={17}/></a>
      </div>
    </div>
  </section>
}
