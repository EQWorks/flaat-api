const express = require('express')
const jwt = require('jsonwebtoken')
const jwtAuth = require('../middleware/auth')


const router = express.Router()
module.exports = () => {
  // TODO: get a proper private key
  // TODO: rewire api_access when HA side of things are clear
  const privateKey = 'theUltimatePrivateKey'

  router.post('/', jwtAuth, (req, res) => {
    const { device_id, api_access } = jwt.verify(req.flaat_jwt, privateKey)
    const { isHA } = api_access

    res.send('Successfully called me.')
  })
  return router
}
