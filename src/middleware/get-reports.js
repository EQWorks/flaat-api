const moment = require('moment')


module.exports = db => async (req, res, next) => {
  // ASSUME: always specify location & verification
  const { verified, fromDate } = req.query
  const { locations } = req.body
  const selectFromDate = moment.unix(fromDate).format()
  let reports

  try {
    if (fromDate) {
      reports = await Promise.all(locations.map(async (location) => {
        const { rows } = await db.query(
          `
            SELECT r.report, r.cen_keys
            FROM reports r
            WHERE r.reported_at::date >= $1
              AND r.verified = $2
              AND (r.trace_list_id IS NULL OR EXISTS(
                SELECT * FROM traces t
                WHERE t.geohash = $3
                  AND t.trace_list_id = r.trace_list_id
                  AND (
                    tstzrange(to_timestamp(t.start_time), to_timestamp(t.end_time), '[]')
                    && tstzrange(to_timestamp($4), to_timestamp($5), '[]')
                  ) = true)
              )
          `,
          [selectFromDate, verified, location.geohash, location.start, location.end],
        )
        return rows
      }))
    } else {
      reports = await Promise.all(locations.map(async (location) => {
        const { rows } = await db.query(
          `
            SELECT r.report, r.cen_keys
            FROM reports r
            WHERE r.verified = $1
              AND (r.trace_list_id IS NULL OR EXISTS(
                SELECT * FROM traces t
                WHERE t.geohash = $2
                  AND t.trace_list_id = r.trace_list_id
                  AND (
                    tstzrange(to_timestamp(t.start_time), to_timestamp(t.end_time), '[]')
                    && tstzrange(to_timestamp($3), to_timestamp($4), '[]')
                  ) = true)
              )
          `,
          [verified, location.geohash, location.start, location.end],
        )
        return rows
      }))
    }

    res.json({ reports: reports.flat() })
  } catch (err) {
    return next(err)
  }
}
