import multer from 'multer'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const acceptedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1, fields: 8 },
  fileFilter(_request, file, callback) {
    if (!acceptedMimeTypes.has(file.mimetype)) {
      const error = new Error('Choose a JPEG, PNG, or WebP image.')
      error.status = 400
      error.code = 'INVALID_REPORT_IMAGE'
      callback(error)
      return
    }
    callback(null, true)
  },
})

function matchesImageSignature(file) {
  const { buffer, mimetype } = file
  if (mimetype === 'image/jpeg') {
    return buffer.length >= 3
      && buffer[0] === 0xff
      && buffer[1] === 0xd8
      && buffer[2] === 0xff
  }
  if (mimetype === 'image/png') {
    return buffer.length >= 8
      && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  }
  if (mimetype === 'image/webp') {
    return buffer.length >= 12
      && buffer.toString('ascii', 0, 4) === 'RIFF'
      && buffer.toString('ascii', 8, 12) === 'WEBP'
  }
  return false
}

export const receiveReportImage = upload.single('image')

export function validateReportImage(request, response, next) {
  if (request.file && !matchesImageSignature(request.file)) {
    response.status(400).json({ message: 'The selected file is not a valid JPEG, PNG, or WebP image.' })
    return
  }
  next()
}
