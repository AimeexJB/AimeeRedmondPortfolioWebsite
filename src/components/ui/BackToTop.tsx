import { Icon } from './Icon'

type BackToTopProps = { visible: boolean }

export function BackToTop({ visible }: BackToTopProps) {
  return <a className={`back-to-top ${visible ? 'is-visible' : ''}`} href="#top" aria-label="Back to top"><Icon name="up" size={21}/><span>Top</span></a>
}
