const express = require('express')
const { hasBodyParams } = require('../middleware/validation')
const h = require('../modules/helpers')


const router = express.Router()
module.exports = (db) => {
  const accessKey = h.randomString()
  const hashAccessKey = h.hash(accessKey)

  // don't require password for now
  router.post(
    '/',
    hasBodyParams('app_name', 'app_description'),
    (req, res, next) => {
      const { app_name, app_description, password } = req.body
      const hashPw = password ? h.hash(password) : null

      db.query(
        `
          INSERT INTO api_access(app_name, app_description, password, access_key)
          VALUES($1, $2, $3, $4) RETURNING *
        `,
        [app_name, app_description, hashPw, hashAccessKey],
      )
        .then(() => res.json({ access_key: accessKey }))
        .catch(next)
    },
  )

  return router
  // TODO: update access_key
}
