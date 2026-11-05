import type { CmsProject, SiteContent, TextItem } from '../types/content'
import { Field, ImageField, ListEditor, NumberField, RichField, TagsField, Toggle } from './fields'
import type { SectionKey } from './sections'

type FormProps<K extends SectionKey> = {
  value: SiteContent[K]
  onChange: (value: SiteContent[K]) => void
}

// Small helper so each form can update one field without repeating the spread.
function setter<T>(value: T, onChange: (value: T) => void) {
  return <K extends keyof T>(key: K) => (next: T[K]) => onChange({ ...value, [key]: next })
}

function TextItems({ items, onChange, noun, max }: { items: TextItem[]; onChange: (items: TextItem[]) => void; noun: string; max: number }) {
  return <ListEditor
    items={items}
    onChange={onChange}
    max={max}
    addLabel={`Add ${noun}`}
    create={() => ({ title: '', body: '' })}
    itemTitle={(item, index) => `${String(index + 1).padStart(2, '0')} · ${item.title || `New ${noun}`}`}
    renderItem={(item, update) => <>
      <Field label="Title" value={item.title} onChange={(title) => update({ ...item, title })}/>
      <Field label="Description" value={item.body} multiline onChange={(body) => update({ ...item, body })}/>
    </>}
  />
}

function SiteForm({ value, onChange }: FormProps<'site'>) {
  const set = setter(value, onChange)
  return <>
    <Field label="Your name" value={value.name} onChange={set('name')} hint="Used in the footer, the logo’s label and image descriptions."/>
    <Field label="Page title" value={value.metaTitle} onChange={set('metaTitle')} hint="Shown in the browser tab and search results."/>
    <Field label="Search description" value={value.metaDescription} multiline onChange={set('metaDescription')} hint="The short summary search engines show under your title."/>
    <Field label="GitHub profile link" type="url" value={value.githubUrl} onChange={set('githubUrl')} placeholder="https://github.com/…"/>
    <Field label="GitHub username" value={value.githubUsername} onChange={set('githubUsername')} hint="Used to load your repositories for the Work section’s GitHub feed."/>
  </>
}

function HeroForm({ value, onChange }: FormProps<'hero'>) {
  const set = setter(value, onChange)
  return <>
    <Field label="Small line above the headline" value={value.eyebrow} onChange={set('eyebrow')}/>
    <RichField label="Headline" value={value.title} onChange={set('title')}/>
    <Field label="Introduction" value={value.intro} multiline onChange={set('intro')}/>
    <Field label="Button text" value={value.ctaLabel} onChange={set('ctaLabel')}/>
    <ImageField label="Portrait photo" value={value.portraitImage} onChange={set('portraitImage')} hint="Optional. Without a photo, the illustrated letter below is shown. Shown on tablets and larger."/>
    {!value.portraitImage && <div className="cms-row">
      <Field label="Portrait letter" value={value.portraitLetter} onChange={set('portraitLetter')}/>
      <Field label="Portrait caption" value={value.portraitTagline} multiline rows={2} onChange={set('portraitTagline')}/>
    </div>}
    <div className="cms-row">
      <Field label="Location" value={value.location} onChange={set('location')}/>
      <Field label="Availability" value={value.availability} onChange={set('availability')}/>
    </div>
  </>
}

function AboutForm({ value, onChange }: FormProps<'about'>) {
  const set = setter(value, onChange)
  return <>
    <Field label="Section label" value={value.label} onChange={set('label')}/>
    <RichField label="Headline" value={value.title} onChange={set('title')}/>
    <h3 className="cms-subheading">Paragraphs</h3>
    <ListEditor
      items={value.paragraphs}
      onChange={set('paragraphs')}
      max={8}
      addLabel="Add paragraph"
      create={() => ''}
      itemTitle={(_, index) => `Paragraph ${index + 1}`}
      renderItem={(paragraph, update) => <Field label="Text" value={paragraph} multiline rows={4} onChange={update}/>}
    />
    <Field label="Link text" value={value.ctaLabel} onChange={set('ctaLabel')} hint="Links to the Contact section."/>
  </>
}

function SkillsForm({ value, onChange }: FormProps<'skills'>) {
  const set = setter(value, onChange)
  return <>
    <Field label="Section label" value={value.label} onChange={set('label')}/>
    <RichField label="Headline" value={value.title} onChange={set('title')}/>
    <h3 className="cms-subheading">Skills</h3>
    <TextItems items={value.items} onChange={set('items')} noun="skill" max={12}/>
  </>
}

function newProject(): CmsProject {
  return { id: crypto.getRandomValues(new Uint32Array(2)).join('-'), name: '', category: '', description: '', tags: [], image: null, codeUrl: '', liveUrl: '' }
}

function WorkForm({ value, onChange }: FormProps<'work'>) {
  const set = setter(value, onChange)
  return <>
    <Field label="Section label" value={value.label} onChange={set('label')}/>
    <RichField label="Headline" value={value.title} onChange={set('title')}/>
    <Field label="Introduction" value={value.intro} multiline onChange={set('intro')}/>
    <h3 className="cms-subheading">Your projects</h3>
    <p className="cms-hint">Shown first, in this order.</p>
    <ListEditor
      items={value.projects}
      onChange={set('projects')}
      max={24}
      addLabel="Add project"
      create={newProject}
      itemTitle={(project) => project.name || 'New project'}
      renderItem={(project, update) => {
        const setProject = setter(project, update)
        return <>
          <Field label="Name" value={project.name} onChange={setProject('name')}/>
          <Field label="Category" value={project.category} onChange={setProject('category')} placeholder="e.g. React, Branding, Web app"/>
          <Field label="Description" value={project.description} multiline rows={4} onChange={setProject('description')}/>
          <TagsField label="Tags" value={project.tags} onChange={setProject('tags')}/>
          <ImageField label="Image" value={project.image} onChange={setProject('image')} hint="Optional. Without one, the project’s first letter is shown."/>
          <div className="cms-row">
            <Field label="Code link" type="url" value={project.codeUrl} onChange={setProject('codeUrl')} placeholder="https://github.com/…"/>
            <Field label="Live site link" type="url" value={project.liveUrl} onChange={setProject('liveUrl')} placeholder="https://…"/>
          </div>
        </>
      }}
    />
    <h3 className="cms-subheading">GitHub feed</h3>
    <Toggle label="Also show my latest GitHub repositories" checked={value.showGithubFeed} onChange={set('showGithubFeed')} hint="Loaded live from GitHub after your own projects. Forks and this website’s repo are skipped."/>
    {value.showGithubFeed && <NumberField label="How many repositories" value={value.githubLimit} min={1} max={24} onChange={set('githubLimit')}/>}
    <Field label="“View all” button text" value={value.githubLinkLabel} onChange={set('githubLinkLabel')} hint="Links to your GitHub repositories. Leave empty to hide the button."/>
  </>
}

function ProcessForm({ value, onChange }: FormProps<'process'>) {
  const set = setter(value, onChange)
  return <>
    <Field label="Section label" value={value.label} onChange={set('label')}/>
    <RichField label="Headline" value={value.title} onChange={set('title')}/>
    <h3 className="cms-subheading">Steps</h3>
    <TextItems items={value.steps} onChange={set('steps')} noun="step" max={8}/>
  </>
}

function ContactForm({ value, onChange }: FormProps<'contact'>) {
  const set = setter(value, onChange)
  return <>
    <Field label="Section label" value={value.label} onChange={set('label')}/>
    <Field label="Intro line" value={value.intro} onChange={set('intro')}/>
    <RichField label="Headline" value={value.title} onChange={set('title')}/>
    <Field label="Email address" type="email" value={value.email} onChange={set('email')}/>
  </>
}

type SectionFormProps = {
  section: SectionKey
  content: SiteContent
  onChange: (content: SiteContent) => void
}

export function SectionForm({ section, content, onChange }: SectionFormProps) {
  const update = <K extends SectionKey>(key: K) => (value: SiteContent[K]) => onChange({ ...content, [key]: value })
  switch (section) {
    case 'site': return <SiteForm value={content.site} onChange={update('site')}/>
    case 'hero': return <HeroForm value={content.hero} onChange={update('hero')}/>
    case 'about': return <AboutForm value={content.about} onChange={update('about')}/>
    case 'skills': return <SkillsForm value={content.skills} onChange={update('skills')}/>
    case 'work': return <WorkForm value={content.work} onChange={update('work')}/>
    case 'process': return <ProcessForm value={content.process} onChange={update('process')}/>
    case 'contact': return <ContactForm value={content.contact} onChange={update('contact')}/>
  }
}
