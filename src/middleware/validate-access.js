const h = require('../modules/helpers')
const { ErrorHandler } = require('../modules/errors')


module.exports = db => async (req, _, next) => {
  const { app_name, access_key } = req.body

  const hashedAccess = await db.query(
    `
      SELECT id, access_key FROM api_access WHERE app_name = $1
    `,
    [app_name],
  ).then(r => r.rows[0]).catch(next)


  if (!h.compareHash(access_key, hashedAccess.access_key)) {
    return next(new ErrorHandler(403, 'Invalid access.'))
  }

  req.access_id = hashedAccess.id
  next()
}
