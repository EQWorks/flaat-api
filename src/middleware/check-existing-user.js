const { ErrorHandler } = require('../modules/errors')


module.exports = db => async (req, _, next) => {
  const { device_id } = req.body
  const { access_id } = req
  let userId

  // check users table if user exists
  const existingUser = await db.query(
    `
      SELECT * FROM users WHERE device_id = $1
    `,
    [device_id],
  ).then(r => r.rows[0]).catch(next)

  if (existingUser) {
    if (existingUser.api_access_id === access_id) {
      userId = existingUser.id
    } else {
      return next(new ErrorHandler(403, 'Invalid Access.'))
    }
  } else {
    // create new user
    userId = await db.query(
      `
        INSERT INTO users(device_id, api_access_id) VALUES ($1, $2) RETURNING *
      `,
      [device_id, access_id],
    ).then(r => r.rows[0].id).catch(next)
  }

  req.user_id = userId
  next()
}
