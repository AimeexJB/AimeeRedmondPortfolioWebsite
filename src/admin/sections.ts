import type { SiteContent } from '../types/content'

export type SectionKey = keyof SiteContent

export const sections: { key: SectionKey; label: string; description: string }[] = [
  { key: 'site', label: 'Site & links', description: 'Your name, search engine text and GitHub profile.' },
  { key: 'hero', label: 'Intro', description: 'The first thing visitors see at the top of the page.' },
  { key: 'about', label: 'About', description: 'A short introduction to you and how you work.' },
  { key: 'skills', label: 'Expertise', description: 'The skills grid. Numbers are added automatically.' },
  { key: 'work', label: 'Work', description: 'Your own projects, plus the optional GitHub feed underneath.' },
  { key: 'process', label: 'Approach', description: 'The numbered steps in the dark “My approach” band.' },
  { key: 'contact', label: 'Contact', description: 'The closing section and your email address.' },
]
