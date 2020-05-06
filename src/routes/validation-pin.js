const express = require('express')
const h = require('../modules/helpers')


const router = express.Router()
module.exports = (db) => {
  router.get('/', (_, res, next) => {
    const pin = h.randomString()

    db.query(
      `
        INSERT INTO static_pins(pin) VALUES ($1) RETURNING *
      `,
      [pin],
    ).then(() => res.json({ pin })).catch(next)
  })
  return router
}
