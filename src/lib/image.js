// Shrinks a photo in the browser before upload: phone cameras produce 3–10 MB files, while the hosted
// API (Vercel) accepts at most 4.5 MB per request, and RT accounts upload over mobile data.
// Photos larger than MAX_SIDE or COMPRESS_FROM_BYTES are redrawn as JPEG; small ones are sent as-is.

const MAX_SIDE = 1600
const QUALITY = 0.82
const COMPRESS_FROM_BYTES = 1024 * 1024

function toBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

// → a File ready to upload (the original when it is already small or the browser can't decode it)
export async function compressPhoto(file) {
  let bitmap
  try {
    // from-image: phone photos are stored sideways with an EXIF rotation; draw them upright
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    return file
  }

  try {
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
    if (scale === 1 && file.size <= COMPRESS_FROM_BYTES) return file

    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    const ctx = canvas.getContext('2d')
    // JPEG has no transparency: put transparent PNG areas on white instead of black
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

    const blob = await toBlob(canvas, 'image/jpeg', QUALITY)
    if (!blob || blob.size >= file.size) return file

    const name = file.name.replace(/\.[^.]+$/, '') || 'foto'
    return new File([blob], `${name}.jpg`, { type: 'image/jpeg' })
  } finally {
    bitmap.close()
  }
}
