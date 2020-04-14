function APIError(msg) {
  this.message = msg
  this.status = 500
  Error.captureStackTrace(this, APIError)
}
// APIError.prototype = Object.create(Error.prototype)

function ValidationError(msg) {
  this.message = msg
  this.status = 400
  Error.captureStackTrace(this, ValidationError)
}

function AuthError(msg) {
  this.message = msg
  this.status = 403
  Error.captureStackTrace(this, AuthError)
}

module.exports = { APIError, ValidationError, AuthError }
