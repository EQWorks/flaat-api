module.exports = (req, res, next) => {
  const { authorization } = req.headers
  if (authorization) {
    const token = authorization.split(' ')[1]
    req.flaat_jwt = token
    next()
  } else {
    res.status(403).send('Forbidden Access.')
  }
}
