import { useEffect, useRef, useState } from 'react'
import { Header } from './components/layout/Header'
import { About } from './components/sections/About'
import { Contact } from './components/sections/Contact'
import { Hero } from './components/sections/Hero'
import { Process } from './components/sections/Process'
import { Skills } from './components/sections/Skills'
import { Work } from './components/sections/Work'
import { BackToTop } from './components/ui/BackToTop'
import { ProjectDialog } from './components/ui/ProjectDialog'
import { fallbackProjects } from './data/content'
import type { Repo } from './types/project'

type Theme = 'light' | 'dark'

// The GitHub API returns every public repo, including this portfolio site itself.
// Filter it out by name so it doesn't show up as one of the featured "projects".
const PORTFOLIO_REPO_NAME = 'AimeeRedmondPortfolioWebsite'

function App() {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
  const [menuOpen, setMenuOpen] = useState(false)
  const [repos, setRepos] = useState<Repo[]>(fallbackProjects)
  const [selectedProject, setSelectedProject] = useState<Repo | null>(null)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [contactInView, setContactInView] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const contactRef = useRef<HTMLElement>(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    fetch('https://api.github.com/users/AimeexJB/repos?per_page=100&sort=updated')
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(`GitHub API request failed with status ${response.status}`))))
      .then((data: Repo[]) => {
        const ownProjects = data.filter((repo) => !repo.fork && repo.name !== PORTFOLIO_REPO_NAME)
        if (ownProjects.length) setRepos(ownProjects)
      })
      .catch((error: unknown) => {
        // Fetch can fail for reasons a visitor never sees: no network, GitHub's
        // unauthenticated rate limit (60 requests/hour per IP), or GitHub being down.
        // We still want the page to look intentional, so we quietly keep showing
        // fallbackProjects — but we log the real reason here so it's not a total
        // mystery if you're debugging in devtools.
        console.warn('Could not load repos from GitHub, showing fallback projects instead:', error)
      })
  }, [])

  useEffect(() => {
    if (selectedProject) dialogRef.current?.showModal()
    else dialogRef.current?.close()
  }, [selectedProject])

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

  const featuredProjects = repos.slice(0, 6)

  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <Header
      theme={theme}
      menuOpen={menuOpen}
      onMenuToggle={() => setMenuOpen((open) => !open)}
      onMenuClose={() => setMenuOpen(false)}
      onThemeToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    />
    <main id="main">
      <Hero/>
      <About/>
      <Skills/>
      <Work projects={featuredProjects} onSelectProject={setSelectedProject}/>
      <Process/>
      <Contact sectionRef={contactRef}/>
    </main>
    <BackToTop visible={showBackToTop && !contactInView}/>
    <ProjectDialog dialogRef={dialogRef} project={selectedProject} onClose={() => setSelectedProject(null)}/>
  </>
}

export default App
