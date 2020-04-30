const h = require('../modules/helpers')
const { APIError } = require('../modules/errors')


module.exports = db => async (req, _, next) => {
  const { app_name, access_key } = req.body

  try {
    const { rows } = await db.query(
      `
        SELECT id, access_key FROM api_access WHERE app_name = $1
      `,
      [app_name],
    )

    if (rows.length === 0 || !h.compareHash(access_key, rows[0].access_key)) {
      return next(new APIError(403, 'Invalid access.'))
    }

    req.access_id = rows[0].id
    next()
  } catch (err) {
    return next(err)
  }
}
