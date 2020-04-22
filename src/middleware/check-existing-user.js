const { ErrorHandler } = require('../modules/errors')


module.exports = db => async (req, _, next) => {
  const { device_id } = req.body
  const { access_id } = req
  let userId

  try {
    // check users table if user exists
    const { rows: [{ id, api_access_id }] } = await db.query(
      `
        SELECT * FROM users WHERE device_id = $1
      `,
      [device_id],
    )

    if (id && api_access_id) {
      if (api_access_id !== access_id) {
        return next(new ErrorHandler(403, 'Invalid Access.'))
      }
      userId = id
    } else {
      // create new user
      const { rows: [{ id: newUserId }] } = await db.query(
        `
          INSERT INTO users(device_id, api_access_id) VALUES ($1, $2) RETURNING *
        `,
        [device_id, access_id],
      )
      if (newUserId) userId = newUserId
    }

    req.user_id = userId
    next()
  } catch (err) {
    return next(err)
  }
}
