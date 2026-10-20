import { randomUUID } from 'node:crypto'
import ImageKit, { toFile } from '@imagekit/nodejs'

let imageKitClient

function getImageKitClient() {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY?.trim()
  if (!privateKey) {
    const error = new Error('Image uploads are not configured. Add IMAGEKIT_PRIVATE_KEY to backend/.env.')
    error.status = 503
    throw error
  }
  imageKitClient ??= new ImageKit({ privateKey })
  return imageKitClient
}

const fileExtensions = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export async function uploadReportImage(file) {
  const client = getImageKitClient()
  const fileName = `${randomUUID()}.${fileExtensions[file.mimetype]}`

  try {
    const result = await client.files.upload({
      file: await toFile(file.buffer, fileName, { type: file.mimetype }),
      fileName,
      folder: '/campusfix/reports',
      useUniqueFileName: false,
    })

    if (typeof result.url !== 'string' || typeof result.fileId !== 'string') {
      throw new Error('ImageKit upload response did not contain a file URL and ID.')
    }
    return { imageUrl: result.url, imageFileId: result.fileId }
  } catch (cause) {
    const error = new Error('Image upload failed. Please try again.')
    error.status = 502
    error.cause = cause
    throw error
  }
}

export async function deleteReportImage(imageFileId) {
  if (!imageFileId) return
  await getImageKitClient().files.delete(imageFileId)
}
