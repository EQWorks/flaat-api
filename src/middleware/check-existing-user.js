module.exports = db => async (req, _, next) => {
  const { device_id } = req.body
  const { access_id } = req
  let userId

  const client = await db.connect()
  try {
    await client.query('BEGIN')

    const { rows } = await client.query({
      text: `
        SELECT 
          u.id AS user_id, 
          json_agg(l.api_access_id) AS user_api_access
        FROM users u
        JOIN user_access_list l
          ON u.id = l.user_id
        WHERE u.device_id = $1
        GROUP BY u.id
      `,
      values: [device_id],
    })

    // if user exists
    if (rows.length > 0) {
      const { user_id, user_api_access } = rows[0]
      // TODO: check other credentials if user_api_access array is empty
      if (user_api_access.length > 0 && !user_api_access.includes(access_id)) {
        await client.query(
          `
            INSERT INTO user_access_list(user_id, api_access_id) VALUES ($1, $2)
          `,
          [user_id, access_id],
        )
      }
      userId = user_id
    } else {
      // create new user & user_access_list
      const { rows: [{ id }] } = await client.query(
        `
          INSERT INTO users(device_id) VALUES ($1) RETURNING *
        `,
        [device_id],
      )

      const { rows: newAccess } = await client.query(
        `
          INSERT INTO user_access_list(user_id, api_access_id) VALUES ($1, $2) RETURNING *
        `,
        [id, access_id],
      )

      if (newAccess.length > 0) userId = newAccess[0].user_id
    }

    await client.query('COMMIT')
    req.user_id = userId
    next()
  } catch (err) {
    if (client) await client.query('ROLLBACK')
    return next(err)
  } finally {
    if (client) client.release()
  }
}
