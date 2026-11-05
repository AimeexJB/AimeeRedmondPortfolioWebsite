import { useContext, useId, useState, type ReactNode } from 'react'
import { ImageUploadsContext } from './imageUploads'
import { prepareImage } from './images'

const RICH_HINT = 'Wrap words in *asterisks* for the italic accent. Start a new line for a line break.'

type FieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  hint?: string
  multiline?: boolean
  rows?: number
  type?: 'text' | 'email' | 'url'
  placeholder?: string
}

export function Field({ label, value, onChange, hint, multiline, rows = 3, type = 'text', placeholder }: FieldProps) {
  const id = useId()
  return <div className="cms-field">
    <label htmlFor={id}>{label}</label>
    {multiline
      ? <textarea id={id} value={value} rows={rows} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} aria-describedby={hint ? `${id}-hint` : undefined}/>
      : <input id={id} type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} aria-describedby={hint ? `${id}-hint` : undefined}/>}
    {hint && <p className="cms-hint" id={`${id}-hint`}>{hint}</p>}
  </div>
}

export function RichField(props: Omit<FieldProps, 'multiline' | 'hint'>) {
  return <Field {...props} multiline rows={2} hint={RICH_HINT}/>
}

type ToggleProps = { label: string; checked: boolean; onChange: (checked: boolean) => void; hint?: string }

export function Toggle({ label, checked, onChange, hint }: ToggleProps) {
  const id = useId()
  return <div className="cms-field cms-field--toggle">
    <input id={id} type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)}/>
    <label htmlFor={id}>{label}</label>
    {hint && <p className="cms-hint">{hint}</p>}
  </div>
}

type NumberFieldProps = { label: string; value: number; min: number; max: number; onChange: (value: number) => void; hint?: string }

export function NumberField({ label, value, min, max, onChange, hint }: NumberFieldProps) {
  const id = useId()
  return <div className="cms-field cms-field--narrow">
    <label htmlFor={id}>{label}</label>
    <input id={id} type="number" min={min} max={max} value={value} onChange={(event) => onChange(Math.min(max, Math.max(min, Math.round(Number(event.target.value) || 0))))}/>
    {hint && <p className="cms-hint">{hint}</p>}
  </div>
}

const parseTags = (raw: string) => raw.split(',').map((tag) => tag.trim()).filter(Boolean)

type TagsFieldProps = { label: string; value: string[]; onChange: (value: string[]) => void }

// Keeps what you type (including a trailing comma) while storing a clean list.
export function TagsField({ label, value, onChange }: TagsFieldProps) {
  const [raw, setRaw] = useState(value.join(', '))
  if (parseTags(raw).join('\n') !== value.join('\n')) setRaw(value.join(', '))
  return <Field label={label} value={raw} hint="Separate tags with commas. Up to four are shown." onChange={(next) => { setRaw(next); onChange(parseTags(next)) }}/>
}

type ImageFieldProps = { label: string; value: string | null; onChange: (value: string | null) => void; hint?: string }

export function ImageField({ label, value, onChange, hint }: ImageFieldProps) {
  const id = useId()
  const uploads = useContext(ImageUploadsContext)
  const [status, setStatus] = useState<string | null>(null)

  async function choose(file: File | undefined) {
    if (!file) return
    setStatus('Preparing image…')
    try {
      const image = await prepareImage(file)
      uploads.add(image)
      onChange(image.path)
      setStatus(null)
    } catch (caught) {
      setStatus(caught instanceof Error ? caught.message : 'Couldn’t use that image.')
    }
  }

  return <div className="cms-field">
    <span className="cms-label">{label}</span>
    <div className="cms-image">
      {value ? <img src={uploads.previewUrl(value)} alt=""/> : <div className="cms-image__empty">No image</div>}
      <div className="cms-image__actions">
        <label className="cms-button cms-button--ghost" htmlFor={id}>{value ? 'Replace image' : 'Upload image'}</label>
        <input id={id} className="sr-only" type="file" accept="image/*" onChange={(event) => { void choose(event.target.files?.[0]); event.target.value = '' }}/>
        {value && <button className="cms-button cms-button--ghost" type="button" onClick={() => onChange(null)}>Remove</button>}
      </div>
    </div>
    {(status || hint) && <p className="cms-hint" role={status ? 'status' : undefined}>{status ?? hint}</p>}
  </div>
}

type ListEditorProps<T> = {
  items: T[]
  onChange: (items: T[]) => void
  create: () => T
  itemTitle: (item: T, index: number) => string
  renderItem: (item: T, update: (item: T) => void) => ReactNode
  addLabel: string
  max: number
}

export function ListEditor<T>({ items, onChange, create, itemTitle, renderItem, addLabel, max }: ListEditorProps<T>) {
  const move = (from: number, to: number) => {
    const next = [...items]
    next.splice(to, 0, next.splice(from, 1)[0])
    onChange(next)
  }

  return <div className="cms-list">
    {items.map((item, index) => <div className="cms-list__item" key={index}>
      <div className="cms-list__head">
        <h4>{itemTitle(item, index)}</h4>
        <div className="cms-list__controls">
          <button type="button" className="cms-icon-button" disabled={index === 0} onClick={() => move(index, index - 1)} aria-label={`Move ${itemTitle(item, index)} up`}>↑</button>
          <button type="button" className="cms-icon-button" disabled={index === items.length - 1} onClick={() => move(index, index + 1)} aria-label={`Move ${itemTitle(item, index)} down`}>↓</button>
          <button type="button" className="cms-icon-button cms-icon-button--danger" onClick={() => onChange(items.filter((_, i) => i !== index))} aria-label={`Remove ${itemTitle(item, index)}`}>✕</button>
        </div>
      </div>
      {renderItem(item, (updated) => onChange(items.map((existing, i) => (i === index ? updated : existing))))}
    </div>)}
    {items.length < max && <button type="button" className="cms-button cms-button--ghost" onClick={() => onChange([...items, create()])}>+ {addLabel}</button>}
  </div>
}
