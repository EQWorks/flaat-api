const { ErrorHandler } = require('../modules/errors')


module.exports = db => async (req, _, next) => {
  const { device_id } = req.body
  const { access_id } = req
  let userId

  try {
    // check users table if user exists
    const { rows } = await db.query(
      `
        SELECT * FROM users WHERE device_id = $1
      `,
      [device_id],
    )

    if (rows.length > 0 && rows[0].id && rows[0].api_access_id) {
      if (rows[0].api_access_id !== access_id) {
        return next(new ErrorHandler(403, 'Invalid Access.'))
      }
      userId = rows[0].id
    } else {
      // create new user
      const { rows: [{ id }] } = await db.query(
        `
          INSERT INTO users(device_id, api_access_id) VALUES ($1, $2) RETURNING *
        `,
        [device_id, access_id],
      )
      if (id) userId = id
    }

    req.user_id = userId
    next()
  } catch (err) {
    return next(err)
  }
}
