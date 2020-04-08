const express = require('express')
const jwt = require('jsonwebtoken')
const checkExistingUser = require('../middleware/check-existing-user')


// TODO: device_id encryption?

const router = express.Router()
module.exports = (db) => {
  router.post('/', checkExistingUser(db), async (req, res) => {
    const { device_id } = req.body
    const { user_id } = req

    // TODO: get a proper private key
    // TODO: rewire api_access when HA side of things are clear
    const privateKey = 'theUltimatePrivateKey'
    const token = jwt.sign({ device_id, api_access: { isHA: false } }, privateKey)

    // timestamp every login
    const loginRecorded = await db.query(
      `
        INSERT INTO login(user_id) VALUES ($1) RETURNING *
      `,
      [user_id],
    ).then(r => r.rows[0]).catch(err => res.status(500).json({ error: err.message }))

    if (loginRecorded) res.status(200).json({ token })
  })
  return router
}
