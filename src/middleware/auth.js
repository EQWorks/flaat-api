const jwt = require('jsonwebtoken')


module.exports = (req, res, next) => {
  const { authorization } = req.headers
  if (!authorization) {
    res.status(403).send('Forbidden Access.')
  } else {
    const token = authorization.split(' ')[1]
    // TODO: get a proper private key
    const privateKey = 'theUltimatePrivateKey'
    jwt.verify(token, privateKey, (err) => {
      if (err) {
        res.status(403).send('Forbidden Access.')
      } else {
        req.flaat_jwt = token
        next()
      }
    })
  }
}
