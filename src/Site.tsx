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
import { projectFromCms, projectFromRepo } from './data/projects'
import type { SiteContent } from './types/content'
import type { Project, Repo } from './types/project'
import { getInitialTheme, type Theme } from './utils/theme'

// The GitHub API returns every public repo, including this portfolio site itself.
// Filter it out by name so it doesn't show up as one of the featured "projects".
const PORTFOLIO_REPO_NAME = 'AimeeRedmondPortfolioWebsite'

type SiteProps = { content: SiteContent }

// The whole public page. App renders it with the published content, and the CMS
// renders it with your unsaved draft as a live preview.
export function Site({ content }: SiteProps) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [menuOpen, setMenuOpen] = useState(false)
  const [repos, setRepos] = useState<Repo[]>(fallbackProjects)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [contactInView, setContactInView] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const contactRef = useRef<HTMLElement>(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  const { showGithubFeed } = content.work
  const { githubUsername } = content.site

  useEffect(() => {
    if (!showGithubFeed || !githubUsername) return
    fetch(`https://api.github.com/users/${encodeURIComponent(githubUsername)}/repos?per_page=100&sort=updated`)
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
  }, [showGithubFeed, githubUsername])

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

  // Projects written in the CMS come first, then (if switched on) the latest from GitHub.
  const projects = [
    ...content.work.projects.map(projectFromCms),
    ...(showGithubFeed ? repos.slice(0, content.work.githubLimit).map(projectFromRepo) : []),
  ]

  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <Header
      name={content.site.name}
      githubUrl={content.site.githubUrl}
      theme={theme}
      menuOpen={menuOpen}
      onMenuToggle={() => setMenuOpen((open) => !open)}
      onMenuClose={() => setMenuOpen(false)}
      onThemeToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    />
    <main id="main">
      <Hero content={content.hero} name={content.site.name}/>
      <About content={content.about}/>
      <Skills content={content.skills}/>
      <Work content={content.work} githubUrl={content.site.githubUrl} projects={projects} onSelectProject={setSelectedProject}/>
      <Process content={content.process}/>
      <Contact content={content.contact} name={content.site.name} sectionRef={contactRef}/>
    </main>
    <BackToTop visible={showBackToTop && !contactInView}/>
    <ProjectDialog dialogRef={dialogRef} project={selectedProject} onClose={() => setSelectedProject(null)}/>
  </>
}
