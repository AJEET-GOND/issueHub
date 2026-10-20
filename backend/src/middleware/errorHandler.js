function errorHandler(error, _request, response, _next) {
  if (response.headersSent) return

  if (error?.name === 'MulterError' && error.code === 'LIMIT_FILE_SIZE') {
    response.status(413).json({ message: 'Image must be 5 MB or smaller.' })
    return
  }
  if (error?.name === 'MulterError') {
    response.status(400).json({ message: 'Please upload only one image with this report.' })
    return
  }
  if (error?.code === 11000) {
    response.status(409).json({ message: 'An account with this email already exists.' })
    return
  }
  if (error?.name === 'ValidationError') {
    response.status(400).json({ message: 'Please check the submitted information.' })
    return
  }
  if (error?.code === 'INVALID_REPORT_IMAGE') {
    response.status(400).json({ message: error.message })
    return
  }
  if (error?.name === 'CastError') {
    response.status(400).json({ message: 'The requested record is invalid.' })
    return
  }
  if (error?.status === 400) {
    response.status(400).json({ message: 'The request body is invalid.' })
    return
  }
  if (error?.status === 413) {
    response.status(413).json({ message: 'The request is too large.' })
    return
  }

  if (error?.status === 502 || error?.status === 503) {
    console.error(error.cause || error.message)
    response.status(error.status).json({ message: error.message })
    return
  }

  console.error(error)
  response.status(500).json({ message: 'Something went wrong. Please try again.' })
}

export default errorHandler
