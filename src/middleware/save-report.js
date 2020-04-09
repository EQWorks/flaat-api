const jwt = require('jsonwebtoken')


// TODO: error handling (sentry)
module.exports = db => async (req, res, next) => {
  const { validationPin, traces } = req.body
  const { report, reportId, cenKeys } = req._cen
  let trace_id
  let verified
  // TODO: get a proper private key
  const { device_id } = jwt.decode(req.flaat_jwt)

  const userId = await db.query(
    `
      SELECT id FROM users WHERE device_id = ($1)
    `,
    [device_id],
  ).then(r => r.rows[0].id).catch(next)

  // TODO: check existing report (maybe?) OR check one-time validation pin
  if (!validationPin) {
    verified = false
  } else {
    verified = await db.query(
      `
        SELECT 
          EXISTS (SELECT pin FROM static_pins WHERE pin = $1)
      `,
      [validationPin],
    ).then(r => r.rows[0].exists).catch(next)
  }

  if (traces && traces.length > 0) {
    trace_id = await db.query(
      `
        INSERT INTO traces(user_id, trace_history) VALUES ($1, $2)
        RETURNING *
      `,
      [userId, traces],
    ).then(r => r.rows[0].id).catch(next)
  }

  db.query(
    `
      INSERT INTO reports(verified, report, report_id, cen_keys, trace_id)
      VALUES ($1, $2, $3, $4, $5)
    `,
    [verified, report, reportId, cenKeys, trace_id],
  ).then(next()).catch(next)
}
