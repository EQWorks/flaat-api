const moment = require('moment')


module.exports = db => async (req, res, next) => {
  // ASSUME: always verification
  const { verified, fromDate, locations, fullReport } = req.query
  const selectFromDate = moment.unix(fromDate).format()
  let locationArr = []
  let reports

  try {
    if (locations) locationArr = JSON.parse(locations)

    if (!locations || locationArr.length === 0 || !locationArr[0]) {
      if (fromDate) {
        const { rows: reportsInTimeRange } = await db.query({
          text: `
            SELECT report, signature FROM reports
            WHERE verified = $1
              AND reported_at::date >= $2
          `,
          values: [verified, selectFromDate],
          rowMode: 'array',
        })
        reports = reportsInTimeRange
      } else {
        const { rows: allReports } = await db.query({
          text: `
            SELECT report, signature FROM reports WHERE verified = $1
          `,
          values: [verified],
          rowMode: 'array',
        })
        reports = allReports
      }
    } else if (locations && locationArr.length > 0 && locationArr[0]) {
      if (fromDate) {
        reports = await Promise.all(locationArr.map(async (location) => {
          const { rows } = await db.query({
            text: `
              SELECT r.report, r.signature
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
              SELECT r.report, r.signature
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
    }

    const uniqueReports = new Set(reports.flat().map((r) => {
      if (fullReport) {
        const reportBuffer = Buffer.from(r[0], 'base64')
        const signatureBuffer = Buffer.from(r[1], 'base64')
        return Buffer.concat([reportBuffer, signatureBuffer]).toString('base64')
      }
      return r[0]
    }))

    res.json({ reports: [...uniqueReports] })
  } catch (err) {
    return next(err)
  }
}
