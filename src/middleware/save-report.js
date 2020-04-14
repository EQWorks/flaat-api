const jwt = require('jsonwebtoken')
const { APIError } = require('../modules/errors')


module.exports = db => async (req, _, next) => {
  const { validationPin, traces } = req.body
  const { report, reportId, cenKeys } = req._cen
  const { device_id } = jwt.decode(req.flaat_jwt)
  let trace_id
  let verified

  const client = await db.connect()
  try {
    await client.query('BEGIN')

    // TODO: check existing report (maybe?) OR check one-time validation pin
    if (!validationPin) {
      verified = false
    } else {
      verified = await client.query(
        `
          SELECT 
            EXISTS (SELECT pin FROM static_pins WHERE pin = $1)
        `,
        [validationPin],
      )
        .then(r => r.rows[0].exists)
        .catch(err => (
          next(new APIError(`Unsuccessful upload: invalid validation pin. ${err.message}`))
        ))
    }

    // APPROACH-1: dump everything under one column
    if (traces && traces.length > 0) {
      trace_id = await client.query(
        `
          INSERT INTO traces(user_id, trace_history) VALUES (
            (SELECT id FROM users WHERE device_id = $1),
            $2)
          RETURNING *
        `,
        [device_id, traces],
      )
        .then(r => r.rows[0].id)
        .catch(err => (
          next(new APIError(`Unsuccessful upload: failed to store trace history. ${err.message}`))
        ))
    }

    // APPROACH-2: create a list table and instance each item in list
    // if (traces && traces.length > 0) {
    //   traceListId = await db.query(
    //     `
    //       INSERT INTO trace_list(user_id) VALUES ($1) RETURNING *
    //     `,
    //     [userId],
    //   )
    //     .then(r => r.rows[0].id)
    //     .catch((err) => { next(new APIError(`Unsuccessful upload: ${err.message}`)) })

    //   traces.forEach((trace) => {
    //     db.query(
    //       `
    //         INSERT INTO traces(geohash, start_time, end_time, trace_list_id)
    //         VALUES ($1, $2, $3, $4)
    //       `,
    //       [trace.geohash, trace.start, trace.end, traceListId],
    //     )
    //   })
    // }

    client.query(
      `
        INSERT INTO reports(verified, report, report_id, cen_keys, trace_id)
        VALUES ($1, $2, $3, $4, $5) RETURNING *
      `,
      [verified, report, reportId, cenKeys, trace_id],
    )
      .then(r => r)
      .catch(err => (
        next(new APIError(`Unsuccessful upload: failed to save report. ${err.message}`))
      ))

    await client.query('COMMIT')
  } catch (err) {
    if (client) {
      await client.query('ROLLBACK')
    }
  } finally {
    if (client) {
      client.release()
    }
    next()
  }
}
