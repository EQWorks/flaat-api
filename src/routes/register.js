const express = require('express')


const router = express.Router()

module.exports = (db) => {
  router.post('/get_pin', (req, res) => {
    console.log('request', req.body)
    // TODO: validate number again before query
    const { phone_num } = req.body
    // TODO: generate & properly manage temporary pin
    const tempPin = 123456
    if (phone_num) {
      db.query(
        `
          INSERT INTO users(phone_number, temp_pin)
          VALUES ($1, $2) RETURNING *;
        `,
        [phone_num, tempPin],
      )
        .then((res) => {
          console.log('RESPONSE', res.rows[0])
          const { phone_number, temp_pin } = res.rows[0]
          // TODO: send pin via sms (how to implement short-lived pin???)
        })
        .catch(err => res.status(500).json({ error: err.message }))
    } else {
      res.send('Phone number needed.')
    }
  })

  router.post('/', async (req, res) => {
    // TODO: check if phone_num exists in db before proceed (+ whether temp_pin expired or not)
    const { phone_num, temp_pin, device_id } = req.body
    if (!phone_num) {
      res.send('Phone number needed.')
    } else {
      const getPin = await db.query(
        `
          SELECT id, temp_pin FROM users WHERE phone_number = $1;
        `,
        [phone_num],
      )
        .then(res => res.rows[0])
        .catch(err => res.status(500).json({ error: err.message }))
      const tempPin = getPin.temp_pin
      // TODO: encrypt user_id
      const userID = getPin.id
      // TODO: check if temp_pin matches (+ proper method to upsert temp_pin)
      if (Number(tempPin) !== temp_pin) {
        console.log('here===========', tempPin)
        res.json({ valid: false })
      } else {
        await db.query(
          `
            UPDATE users SET device_id = $1 WHERE id = $2;
          `,
          [device_id, userID],
        )
          .then(() => console.log('device_id added'))
          .catch(err => res.status(500).json({ error: err.message }))
        res.json({
          valid: true,
          user_id: userID,
        })
      }
    }
  })
  return router
}
