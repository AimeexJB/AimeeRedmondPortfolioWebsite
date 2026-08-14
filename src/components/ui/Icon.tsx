import type { ReactNode } from 'react'

export type IconName = 'sun' | 'moon' | 'arrow' | 'up' | 'menu' | 'close' | 'github' | 'external'

type IconProps = {
  name: IconName
  size?: number
}

const paths: Record<IconName, ReactNode> = {
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>,
  moon: <path d="M20.6 15.7A9 9 0 0 1 8.3 3.4 9 9 0 1 0 20.6 15.7Z"/>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6"/>,
  up: <path d="M12 19V5M6 11l6-6 6 6"/>,
  menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
  close: <path d="m6 6 12 12M18 6 6 18"/>,
  github: <><path d="M15 22v-3.87c.04-.51-.1-1.01-.4-1.42 2.75-.31 5.64-1.35 5.64-6.12a4.8 4.8 0 0 0-1.28-3.32 4.47 4.47 0 0 0-.12-3.28s-1.04-.33-3.41 1.27a11.77 11.77 0 0 0-6.21 0C6.85 3.66 5.81 4 5.81 4A4.47 4.47 0 0 0 5.7 7.27a4.8 4.8 0 0 0-1.29 3.33c0 4.76 2.89 5.8 5.64 6.11-.3.4-.43.91-.4 1.42V22"/><path d="M9 19c-2.4.74-2.4-1.2-3.36-1.5"/></>,
  external: <path d="M14 4h6v6M10 14 20 4M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5"/>,
}

export function Icon({ name, size = 20 }: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  return <svg {...common}>{paths[name]}</svg>
}
