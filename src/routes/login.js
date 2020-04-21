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
    async (req, res) => {
      const { device_id } = req.body
      const { user_id } = req

      // TODO: get a proper private key
      const privateKey = 'theUltimatePrivateKey'
      const token = jwt.sign({ device_id }, privateKey, { expiresIn: '30d' })
      // TODO: checkin with Eugene on mobile app logout for ttl

      // timestamp every login
      const loginRecorded = await db.query(
        `
          INSERT INTO login(user_id) VALUES ($1) RETURNING *
        `,
        [user_id],
      ).then(r => r.rows[0]).catch(err => res.status(500).json({ message: err.message }))

      if (loginRecorded) res.status(200).json({ token })
    },
  )
  return router
}
