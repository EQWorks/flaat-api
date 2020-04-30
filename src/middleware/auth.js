const jwt = require('jsonwebtoken')
const { APIError } = require('../modules/errors')


module.exports = (req, _, next) => {
  const { authorization } = req.headers
  if (!authorization) {
    return next(new APIError(403, 'Forbidden Access.'))
  }
  const token = authorization.split(' ')[1]
  jwt.verify(token, process.env.AUTH_PRIVATE_KEY, (err) => {
    if (err) {
      return next(new APIError(403, 'Invalid Token.'))
    }
    req.flaat_jwt = token
    next()
  })
}
