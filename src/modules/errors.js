function APIError(statusCode, msg, err) {
  this.statusCode = statusCode
  this.message = msg
  this.error = err
  Error.captureStackTrace(this, APIError)
}

// eslint-disable-next-line no-unused-vars
const ErrorHandler = (err, req, res, next) => {
  const { statusCode, message, error } = err
  console.error(error || message)
  res.status(statusCode || 500).json({ statusCode, message })
}

module.exports = { APIError, ErrorHandler }
