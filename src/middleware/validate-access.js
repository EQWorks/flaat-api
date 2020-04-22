const h = require('../modules/helpers')
const { ErrorHandler } = require('../modules/errors')


module.exports = db => async (req, _, next) => {
  const { app_name, access_key } = req.body

  try {
    const { rows: [{ id, access_key: hashedAccess }] } = await db.query(
      `
        SELECT id, access_key FROM api_access WHERE app_name = $1
      `,
      [app_name],
    )

    if (!h.compareHash(access_key, hashedAccess)) {
      return next(new ErrorHandler(403, 'Invalid access.'))
    }

    req.access_id = id
    next()
  } catch (err) {
    return next(err)
  }
}
