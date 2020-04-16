function ErrorHandler(statusCode, msg, err) {
  this.statusCode = statusCode
  this.message = msg
  this.error = err
  Error.captureStackTrace(this, ErrorHandler)
}

const catchAllError = (err, res) => {
  const { statusCode, message, error } = err
  console.error(error || message)
  res.status(statusCode || 500).json({ statusCode, message })
}

module.exports = { ErrorHandler, catchAllError }
