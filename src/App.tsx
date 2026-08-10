import { useEffect, useRef, useState } from 'react'

type Theme = 'light' | 'dark'
type Repo = { id: number; name: string; description: string | null; html_url: string; homepage: string | null; language: string | null; topics?: string[]; updated_at: string; stargazers_count: number; fork: boolean }

const fallbackProjects: Repo[] = [
  { id: 1, name: 'vue-project', description: 'A personal portfolio experiment built with Vue, Vite and a focus on approachable component design.', html_url: 'https://github.com/AimeexJB/vue-project', homepage: 'https://www.aimeeredmond.com/', language: 'Vue', topics: ['Portfolio', 'Vue'], updated_at: '2025-01-01', stargazers_count: 0, fork: false },
  { id: 2, name: 'portfolio-in-progress', description: 'A collection of ideas and experiments for thoughtful, accessible digital experiences.', html_url: 'https://github.com/AimeexJB', homepage: null, language: 'TypeScript', topics: ['Accessibility', 'UI'], updated_at: '2025-01-01', stargazers_count: 0, fork: false },
]

const skills = [
  ['01', 'Accessible front-end', 'Semantic HTML, keyboard-first interactions, sensible focus states and inclusive experiences.'],
  ['02', 'Interface craft', 'Thoughtful layouts, responsive systems and polished details that make a product feel considered.'],
  ['03', 'Modern JavaScript', 'React, Vue, TypeScript and component architecture built to stay easy to evolve.'],
  ['04', 'Performance-minded', 'Lean builds, deliberate assets and a practical eye on the experience at every connection speed.'],
]

function Icon({ name, size = 20 }: { name: 'sun' | 'moon' | 'arrow' | 'up' | 'menu' | 'close' | 'github' | 'external'; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }
  if (name === 'sun') return <svg {...common}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
  if (name === 'moon') return <svg {...common}><path d="M20.6 15.7A9 9 0 0 1 8.3 3.4 9 9 0 1 0 20.6 15.7Z"/></svg>
  if (name === 'arrow') return <svg {...common}><path d="M5 12h14M13 6l6 6-6 6"/></svg>
  if (name === 'up') return <svg {...common}><path d="M12 19V5M6 11l6-6 6 6"/></svg>
  if (name === 'menu') return <svg {...common}><path d="M4 7h16M4 12h16M4 17h16"/></svg>
  if (name === 'close') return <svg {...common}><path d="m6 6 12 12M18 6 6 18"/></svg>
  if (name === 'github') return <svg {...common}><path d="M15 22v-3.87c.04-.51-.1-1.01-.4-1.42 2.75-.31 5.64-1.35 5.64-6.12a4.8 4.8 0 0 0-1.28-3.32 4.47 4.47 0 0 0-.12-3.28s-1.04-.33-3.41 1.27a11.77 11.77 0 0 0-6.21 0C6.85 3.66 5.81 4 5.81 4A4.47 4.47 0 0 0 5.7 7.27a4.8 4.8 0 0 0-1.29 3.33c0 4.76 2.89 5.8 5.64 6.11-.3.4-.43.91-.4 1.42V22"/><path d="M9 19c-2.4.74-2.4-1.2-3.36-1.5"/></svg>
  return <svg {...common}><path d="M14 4h6v6M10 14 20 4M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5"/></svg>
}

function App() {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
  const [menuOpen, setMenuOpen] = useState(false)
  const [repos, setRepos] = useState<Repo[]>(fallbackProjects)
  const [selectedProject, setSelectedProject] = useState<Repo | null>(null)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [contactInView, setContactInView] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const contactRef = useRef<HTMLElement>(null)

  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('theme', theme) }, [theme])
  useEffect(() => {
    fetch('https://api.github.com/users/AimeexJB/repos?per_page=100&sort=updated')
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data: Repo[]) => { const own = data.filter((repo) => !repo.fork); if (own.length) setRepos(own) })
      .catch(() => undefined)
  }, [])
  useEffect(() => { if (selectedProject) dialogRef.current?.showModal(); else dialogRef.current?.close() }, [selectedProject])
  useEffect(() => {
    const updateBackToTop = () => setShowBackToTop(window.scrollY > window.innerHeight * 0.75)
    updateBackToTop()
    window.addEventListener('scroll', updateBackToTop, { passive: true })
    return () => window.removeEventListener('scroll', updateBackToTop)
  }, [])
  useEffect(() => {
    const contact = contactRef.current
    if (!contact) return
    const observer = new IntersectionObserver(([entry]) => setContactInView(entry.isIntersecting), { threshold: 0.1 })
    observer.observe(contact)
    return () => observer.disconnect()
  }, [])

  const closeMenu = () => setMenuOpen(false)
  const nav = ['About', 'Skills', 'Work', 'Contact']
  const featured = repos.slice(0, 6)

  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Aimee Redmond, home">AR<span>.</span></a>
      <button className="menu-button" type="button" aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <Icon name="close"/> : <Icon name="menu"/>}<span className="sr-only">{menuOpen ? 'Close' : 'Open'} menu</span></button>
      <nav id="main-navigation" className={menuOpen ? 'is-open' : ''} aria-label="Main navigation">
        {nav.map((item) => <a key={item} href={`#${item.toLowerCase()}`} onClick={closeMenu}>{item}</a>)}
        <a className="nav-github" href="https://github.com/AimeexJB" target="_blank" rel="noreferrer"><Icon name="github" size={17}/> GitHub</a>
      </nav>
      <button className="theme-toggle" type="button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
        <span className={theme === 'light' ? 'active sun' : 'sun'}><Icon name="sun" size={17}/></span><span className={theme === 'dark' ? 'active moon' : 'moon'}><Icon name="moon" size={17}/></span>
      </button>
    </header>

    <main id="main">
      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero__orb hero__orb--one"/><div className="hero__orb hero__orb--two"/>
        <div className="hero__content container">
          <p className="eyebrow"><span/> Front-end developer &amp; problem solver</p>
          <div className="hero__grid">
            <div><h1 id="hero-title">Building thoughtful<br/><em>digital experiences.</em></h1><p className="hero__intro">Hi, I’m Aimee. I turn ideas into accessible, engaging websites with clarity, curiosity and a love for the small details.</p><a className="button button--primary" href="#work">Explore my work <Icon name="arrow" size={18}/></a></div>
            <div className="portrait-wrap" aria-label="Decorative profile illustration"><div className="portrait"><div className="portrait__shine"/><span>A</span><p>creative<br/>developer</p></div><div className="orbit orbit--one"/><div className="orbit orbit--two"/><p className="portrait-caption">Based in the UK<br/><b>Available for new ideas</b></p></div>
          </div>
        </div>
        <a className="scroll-cue" href="#about"><span>Scroll to discover</span><i/></a>
      </section>

      <section className="about section container" id="about" aria-labelledby="about-title">
        <div className="section-label">01 / About</div>
        <div className="about__content"><h2 id="about-title">A developer who cares about <em>how it feels</em> to use the web.</h2><div><p>I’m Aimee, a front-end developer with an eye for clean interfaces and a practical, people-first approach to building them. I enjoy the space where thoughtful design and well-crafted code meet.</p><p>Whether I’m shaping a responsive component system or refining a tiny interaction, I’m always asking: is this clear, useful and welcoming for everyone?</p><a className="text-link" href="#contact">Let’s work together <Icon name="arrow" size={17}/></a></div></div>
      </section>

      <section className="skills section" id="skills" aria-labelledby="skills-title"><div className="container"><div className="section-heading"><div className="section-label">02 / Expertise</div><h2 id="skills-title">The good stuff<br/><em>I bring to the table.</em></h2></div><div className="skills-grid">{skills.map(([number, title, body]) => <article className="skill" key={number}><span>{number}</span><h3>{title}</h3><p>{body}</p><div className="skill__line"/></article>)}</div></div></section>

      <section className="work section container" id="work" aria-labelledby="work-title"><div className="work__top"><div><div className="section-label">03 / Selected work</div><h2 id="work-title">Things I’ve<br/><em>made &amp; learned from.</em></h2></div><p>These projects are pulled directly from GitHub, so this space grows right alongside my work.</p></div><div className="projects-grid">{featured.map((project, index) => <article className={`project-card project-card--${index % 3}`} key={project.id}><button type="button" onClick={() => setSelectedProject(project)} aria-label={`View details for ${project.name}`}><div className="project-card__visual"><span className="project-card__number">0{index + 1}</span><span className="project-card__monogram">{project.name.slice(0, 1).toUpperCase()}</span><span className="project-card__arrow"><Icon name="arrow" size={19}/></span></div><div className="project-card__info"><p>{project.language || 'Web project'}</p><h3>{project.name.replace(/[-_]/g, ' ')}</h3><span>View project</span></div></button></article>)}</div><a className="button button--secondary" href="https://github.com/AimeexJB?tab=repositories" target="_blank" rel="noreferrer">View all on GitHub <Icon name="external" size={17}/></a></section>

      <section className="process section"><div className="container"><div className="process__inner"><div><div className="section-label">04 / My approach</div><h2>Curious by default.<br/><em>Intentional by design.</em></h2></div><ol><li><span>01</span><div><h3>Listen &amp; explore</h3><p>Start with the people, the problem and the possibilities.</p></div></li><li><span>02</span><div><h3>Make it clear</h3><p>Build a useful, accessible foundation before adding the flourish.</p></div></li><li><span>03</span><div><h3>Refine with care</h3><p>Test the details, then keep making the experience feel better.</p></div></li></ol></div></div></section>

      <section className="contact section container" id="contact" aria-labelledby="contact-title" ref={contactRef}><div className="contact__top"><div className="section-label">05 / Contact</div><p>Have an opportunity, an idea, or simply fancy a chat?</p></div><h2 id="contact-title">Let’s make something<br/><em>worth using.</em></h2><a className="email-link" href="mailto:hello@aimeeredmond.com">hello@aimeeredmond.com <Icon name="arrow" size={24}/></a><div className="contact__bottom"><p>© {new Date().getFullYear()} Aimee Redmond</p><a href="#top">Back to top ↑</a></div></section>
    </main>

    <a className={`back-to-top ${showBackToTop && !contactInView ? 'is-visible' : ''}`} href="#top" aria-label="Back to top"><Icon name="up" size={21}/><span>Top</span></a>

    <dialog className="project-dialog" ref={dialogRef} aria-labelledby="dialog-title" onClose={() => setSelectedProject(null)}>{selectedProject && <div className="dialog-content"><button className="dialog-close" type="button" onClick={() => setSelectedProject(null)}><Icon name="close"/><span className="sr-only">Close project details</span></button><div className="dialog-art"><span>{selectedProject.name.slice(0, 1).toUpperCase()}</span></div><div className="dialog-copy"><p className="eyebrow">{selectedProject.language || 'Web project'} · GitHub repository</p><h2 id="dialog-title">{selectedProject.name.replace(/[-_]/g, ' ')}</h2><p>{selectedProject.description || 'An in-progress project from my GitHub portfolio. Explore the repository for the latest work and documentation.'}</p>{selectedProject.topics?.length ? <ul className="tags">{selectedProject.topics.slice(0, 4).map((topic) => <li key={topic}>{topic}</li>)}</ul> : null}<div className="dialog-actions"><a className="button button--primary" href={selectedProject.html_url} target="_blank" rel="noreferrer">View code <Icon name="github" size={17}/></a>{selectedProject.homepage && <a className="text-link" href={selectedProject.homepage} target="_blank" rel="noreferrer">Visit live site <Icon name="external" size={17}/></a>}</div></div></div>}</dialog>
  </>
}

export default App
