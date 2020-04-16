const jwt = require('jsonwebtoken')
const { ErrorHandler } = require('../modules/errors')


module.exports = (req, _, next) => {
  const { authorization } = req.headers
  if (!authorization) {
    throw new ErrorHandler(403, 'Forbidden Access.')
  } else {
    const token = authorization.split(' ')[1]
    // TODO: get a proper private key
    const privateKey = 'theUltimatePrivateKey'
    jwt.verify(token, privateKey, (err) => {
      if (err) {
        throw new ErrorHandler(403, 'Invalid Token.', err)
      } else {
        req.flaat_jwt = token
        next()
      }
    })
  }
}
