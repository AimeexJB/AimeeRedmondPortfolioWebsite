import type { Repo } from '../types/project'

export const navigationItems = ['About', 'Skills', 'Work', 'Contact']

export const skills = [
  ['01', 'Accessible front-end', 'Semantic HTML, keyboard-first interactions, sensible focus states and inclusive experiences.'],
  ['02', 'Interface craft', 'Thoughtful layouts, responsive systems and polished details that make a product feel considered.'],
  ['03', 'Modern JavaScript', 'React, Vue, TypeScript and component architecture built to stay easy to evolve.'],
  ['04', 'Performance-minded', 'Lean builds, deliberate assets and a practical eye on the experience at every connection speed.'],
]

export const fallbackProjects: Repo[] = [
  {
    id: 1,
    name: 'vue-project',
    description: 'A personal portfolio experiment built with Vue, Vite and a focus on approachable component design.',
    html_url: 'https://github.com/AimeexJB/vue-project',
    homepage: 'https://www.aimeeredmond.com/',
    language: 'Vue',
    topics: ['Portfolio', 'Vue'],
    updated_at: '2025-01-01',
    stargazers_count: 0,
    fork: false,
  },
  {
    id: 2,
    name: 'portfolio-in-progress',
    description: 'A collection of ideas and experiments for thoughtful, accessible digital experiences.',
    html_url: 'https://github.com/AimeexJB',
    homepage: null,
    language: 'TypeScript',
    topics: ['Accessibility', 'UI'],
    updated_at: '2025-01-01',
    stargazers_count: 0,
    fork: false,
  },
]
