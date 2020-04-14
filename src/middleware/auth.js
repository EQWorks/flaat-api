const jwt = require('jsonwebtoken')
const { AuthError } = require('../modules/errors')


module.exports = (req, _, next) => {
  const { authorization } = req.headers
  if (!authorization) {
    throw new AuthError('Forbidden Access.')
  } else {
    const token = authorization.split(' ')[1]
    // TODO: get a proper private key
    const privateKey = 'theUltimatePrivateKey'
    jwt.verify(token, privateKey, (err) => {
      if (err) {
        throw new AuthError('Invalid Token.')
      } else {
        req.flaat_jwt = token
        next()
      }
    })
  }
}
