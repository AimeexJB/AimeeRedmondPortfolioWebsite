import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { getInitialTheme } from '../utils/theme'
import { AdminApp } from './AdminApp'
import '../styles/main.scss'
import '../styles/admin.scss'

document.documentElement.dataset.theme = getInitialTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode><AdminApp /></StrictMode>,
)
