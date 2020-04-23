const moment = require('moment')


module.exports = db => async (req, res, next) => {
  // ASSUME: always specify location & verification
  const { verified, fromDate, locations } = req.query
  const selectFromDate = moment.unix(fromDate).format()
  let locationArr = []
  let reports

  try {
    locationArr = JSON.parse(locations)

    if (fromDate) {
      reports = await Promise.all(locationArr.map(async (location) => {
        const { rows } = await db.query({
          text: `
            SELECT r.report
            FROM reports r
            WHERE r.reported_at::date >= $1
              AND r.verified = $2
              AND (r.trace_list_id IS NULL OR EXISTS(
                SELECT * FROM traces t
                WHERE t.trace_list_id = r.trace_list_id
                  AND t.geohash LIKE $3 || '%'
                )
              )
          `,
          values: [selectFromDate, verified, location],
          rowMode: 'array',
        })
        return rows
      }))
    } else {
      reports = await Promise.all(locationArr.map(async (location) => {
        const { rows } = await db.query({
          text: `
            SELECT r.report
            FROM reports r
            WHERE r.verified = $1
              AND (r.trace_list_id IS NULL OR EXISTS(
                SELECT * FROM traces t
                WHERE t.trace_list_id = r.trace_list_id
                  AND t.geohash LIKE $2 || '%'
                )
              )
          `,
          values: [verified, location],
          rowMode: 'array',
        })
        return rows
      }))
    }

    const uniqueReports = new Set(reports.flat(2))

    res.json({ reports: [...uniqueReports] })
  } catch (err) {
    return next(err)
  }
}
