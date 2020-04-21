const { ErrorHandler } = require('../modules/errors')


module.exports = db => async (req, _, next) => {
  const { app_name } = req.body

  const existingApp = await db.query(
    `
      SELECT 
        EXISTS (SELECT app_name FROM api_access WHERE app_name = $1)
    `,
    [app_name],
  ).then(r => r.rows[0].exists).catch(next)

  if (existingApp) {
    return next(new ErrorHandler(400, 'Application name already exists.'))
  }
  next()
}
