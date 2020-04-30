const jwt = require('jsonwebtoken')
const { APIError } = require('../modules/errors')


module.exports = db => async (req, res, next) => {
  const { validationPin, traces } = req.body
  const report = req._tcn
  const signature = req._tcnSignature
  const { device_id } = jwt.decode(req.flaat_jwt)
  let traceListId
  let verified

  const client = await db.connect()
  try {
    await client.query('BEGIN')

    // TODO: check existing report (maybe?) OR check one-time validation pin
    if (!validationPin) {
      verified = false
    } else {
      const { rows: [{ exists }] } = await client.query(
        `
          SELECT 
            EXISTS (SELECT pin FROM static_pins WHERE pin = $1)
        `,
        [validationPin],
      )
      verified = exists
    }

    // APPROACH-2: create a list table and instance each item in list
    if (traces && traces.length > 0) {
      const { rows: [{ id }] } = await client.query(
        `
          INSERT INTO trace_list (user_id)
            SELECT id FROM users WHERE device_id = $1
          RETURNING *
        `,
        [device_id],
      )
      if (id) traceListId = id

      const insertText = traces
        // eslint-disable-next-line max-len
        .map((_, i) => `($${(i * 4) + 1}, to_timestamp($${(i * 4) + 2}), to_timestamp($${(i * 4) + 3}), $${(i * 4) + 4})`)
        .join(', ')
      const insertValues = traces
        // eslint-disable-next-line max-len
        .reduce((values, { geohash, start, end }) => values.push(geohash, start, end, traceListId) && values, [])

      await client.query(
        `
          INSERT INTO traces (geohash, start_time, end_time, trace_list_id)
          VALUES ${insertText}
        `,
        insertValues,
      )
    }

    await client.query(
      `
        INSERT INTO reports (verified, report, signature, trace_list_id)
        VALUES ($1, $2, $3, $4)
      `,
      [verified, report, signature, traceListId],
    )

    await client.query('COMMIT')
    res.send('Successful upload.')
  } catch (err) {
    await client.query('ROLLBACK')
    next(new APIError(500, err.message, err))
  } finally {
    client.release()
  }
}
