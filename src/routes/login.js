const express = require('express')
const jwt = require('jsonwebtoken')
const { hasBodyParams } = require('../middleware/validation')
const checkExistingUser = require('../middleware/check-existing-user')
const validateAccess = require('../middleware/validate-access')


const router = express.Router()
module.exports = (db) => {
  router.post(
    '/',
    hasBodyParams('device_id', 'app_name', 'access_key'),
    validateAccess(db),
    checkExistingUser(db),
    (req, res) => {
      const { device_id } = req.body
      const { user_id } = req

      const token = jwt.sign({ device_id }, process.env.AUTH_PRIVATE_KEY, { expiresIn: '30d' })
      // TODO: checkin with Eugene on mobile app logout for ttl

      // timestamp every login
      db.query(
        `
          INSERT INTO login (user_id) VALUES ($1)
        `,
        [user_id],
      )
        .then(() => res.status(200).json({ token }))
        .catch(err => res.status(500).json({ message: err.message }))
    },
  )
  return router
}
