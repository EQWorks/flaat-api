const { Router } = require('express')
const { hasQueryParams } = require('../middleware/validation')
const jwtAuth = require('../middleware/auth')


module.exports = () => {
  const router = Router()
  router.get('/', jwtAuth, hasQueryParams('os', 'current'), (req, res) => {
    const { os, current } = req.query
    const { APP_VERSION_IOS, APP_VERSION_ANDROID } = process.env
    let newUpdate
    let version

    if (os === 'ios') {
      newUpdate = current !== APP_VERSION_IOS
      version = APP_VERSION_IOS
    }

    if (os === 'android') {
      newUpdate = current !== APP_VERSION_ANDROID
      version = APP_VERSION_ANDROID
    }

    res.json({ newUpdate, version })
  })
  return router
}
