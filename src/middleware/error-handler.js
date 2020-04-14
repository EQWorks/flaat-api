const { APIError, ValidationError, AuthError } = require('../modules/errors')


module.exports = (err, _, res, next) => {
  if (err instanceof APIError) {
    console.log('INCOMING API ERROR')
    return res.status(500).json({ message: err.message })
  }

  if (err instanceof ValidationError) {
    console.log('INCOMING VALIDATION ERROR')
    return res.status(400).json({ message: err.message })
  }

  if (err instanceof AuthError) {
    console.log('INCOMING AUTH ERROR')
    return res.status(403).json({ message: err.message })
  }

  next(err)
}
