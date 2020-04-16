const express = require('express')
const { hasQueryParams } = require('../middleware/validation')
const jwtAuth = require('../middleware/auth')


const router = express.Router()
module.exports = () => {
  router.get('/', jwtAuth, hasQueryParams('os', 'current'), (req, res) => {
    const { os, current } = req.query
    const iosVersion = 'v0.1.0'
    const androidVersion = 'v0.1.0'
    let newUpdate
    let version

    if (os === 'ios') {
      newUpdate = current !== iosVersion
      version = iosVersion
    }

    if (os === 'android') {
      newUpdate = current !== androidVersion
      version = androidVersion
    }

    res.json({ newUpdate, version })
  })
  return router
}
