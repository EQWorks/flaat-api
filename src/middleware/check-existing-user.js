module.exports = db => async (req, _, next) => {
  const { device_id } = req.body
  let userId

  // check users table if user exists
  const existingUser = await db.query(
    `
      SELECT * FROM users WHERE device_id = $1
    `,
    [device_id],
  ).then(r => r.rows[0]).catch(next)

  if (existingUser && existingUser.id) {
    userId = existingUser.id
  } else {
    // create new user
    userId = await db.query(
      `
        INSERT INTO users(device_id) VALUES ($1) RETURNING *
      `,
      [device_id],
    ).then(r => r.rows[0].id).catch(next)
  }

  req.user_id = userId
  next()
}
