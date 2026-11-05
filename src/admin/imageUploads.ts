import { createContext } from 'react'
import type { PreparedImage } from './images'

// Images picked in this session aren't on the server until you save, so the
// editor keeps their previews here and looks them up by path.
type ImageUploads = { previewUrl: (path: string) => string; add: (image: PreparedImage) => void }

export const ImageUploadsContext = createContext<ImageUploads>({ previewUrl: (path) => path, add: () => {} })
