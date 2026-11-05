export type Theme = 'light' | 'dark'

// localStorage can hold anything (old versions, manual edits), so only trust the
// stored value if it's exactly one of our two themes; otherwise use the OS setting.
export function getInitialTheme(): Theme {
  const stored = localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}
