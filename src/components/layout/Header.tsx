import { navigationItems } from '../../data/content'
import { Icon } from '../ui/Icon'

type HeaderProps = {
  theme: 'light' | 'dark'
  menuOpen: boolean
  onMenuToggle: () => void
  onMenuClose: () => void
  onThemeToggle: () => void
}

export function Header({ theme, menuOpen, onMenuToggle, onMenuClose, onThemeToggle }: HeaderProps) {
  return <header className="site-header">
    <a className="brand" href="#top" aria-label="Aimee Redmond, home">AR<span>.</span></a>
    <button className="menu-button" type="button" aria-expanded={menuOpen} aria-controls="main-navigation" onClick={onMenuToggle}>
      {menuOpen ? <Icon name="close"/> : <Icon name="menu"/>}
      <span className="sr-only">{menuOpen ? 'Close' : 'Open'} menu</span>
    </button>
    <nav id="main-navigation" className={menuOpen ? 'is-open' : ''} aria-label="Main navigation">
      {navigationItems.map((item) => <a key={item} href={`#${item.toLowerCase()}`} onClick={onMenuClose}>{item}</a>)}
      <a className="nav-github" href="https://github.com/AimeexJB" target="_blank" rel="noreferrer"><Icon name="github" size={17}/> GitHub</a>
    </nav>
    <button className="theme-toggle" type="button" onClick={onThemeToggle} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
      <span className={theme === 'light' ? 'active sun' : 'sun'}><Icon name="sun" size={17}/></span>
      <span className={theme === 'dark' ? 'active moon' : 'moon'}><Icon name="moon" size={17}/></span>
    </button>
  </header>
}
