// Uploaded photos are shrunk and converted to WebP in the browser before
// saving, so a 6 MB phone photo becomes a few hundred KB in the repo.

const MAX_SIZE = 1600

export type PreparedImage = {
  path: string
  dataUrl: string
  base64: string
}

function slugify(name: string): string {
  return name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'image'
}

export async function prepareImage(file: File): Promise<PreparedImage> {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.')
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_SIZE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  const dataUrl = canvas.toDataURL('image/webp', 0.85)
  if (!dataUrl.startsWith('data:image/webp')) throw new Error('This browser can’t convert images to WebP. Try Chrome, Edge, Firefox or Safari 14+.')
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
  if (base64.length * 0.75 > 1_900_000) throw new Error('That image is still too large after resizing. Try a smaller one.')

  const suffix = crypto.getRandomValues(new Uint32Array(1))[0].toString(36)
  return { path: `/uploads/${slugify(file.name)}-${suffix}.webp`, dataUrl, base64 }
}
