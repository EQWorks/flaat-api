const { APIError, ValidationError } = require('../modules/errors')


module.exports = db => async (req, _, next) => {
  const { device_id } = req.body
  if (!device_id) return next(new ValidationError('Missing fields.'))
  // check users table if user exists
  const existingUser = await db.query(
    `
      SELECT * FROM users WHERE device_id = $1;
    `,
    [device_id],
  )
    .then(r => r.rows[0])
    .catch(err => next(new APIError(`Unsuccessful login: ${err.message}`)))

  if (existingUser) {
    const { id } = existingUser
    req.user_id = id
    next()
  } else {
    // create new user
    db.query(
      `
        INSERT INTO users(device_id) VALUES ($1) RETURNING *
      `,
      [device_id],
    )
      .then((r) => {
        const { id } = r.rows[0]
        req.user_id = id
        next()
      })
      .catch(err => next(new APIError(`Unsuccessful login: ${err.message}`)))
  }
}
