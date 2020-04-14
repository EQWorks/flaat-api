const jwt = require('jsonwebtoken')
const moment = require('moment')
const { APIError } = require('../modules/errors')


// TODO: error handling (sentry)
module.exports = db => async (req, res, next) => {
  // TODO: if null --> get the entire record of reports with no filtering
  //  --> separate by date and location tho
  const { verified, fromDate } = req.query
  const { locations } = req.body
  const selectFromDate = moment.unix(fromDate).format()
  let reports

  if (!fromDate) {
    reports = await db.query(
      `
        SELECT * from reports WHERE verified = $1
      `,
      [verified],
    )

    console.log('reports', reports)
  } else {
    // reports = await db.query(
    //   `
    //     SELECT * FROM reports WHERE reported_at::date >= $1 AND verified = $2
    //   `,
    //   [selectFromDate, verified],
    // ).then(r => r.rows).catch(next)

    // saved with APPROACH-2
    // PROBLEM-1: dedupe
    // PROBLEM-2: overlap dn match same day
    reports = locations.map(async (location) => {
      const report = await db.query(
        `
          SELECT
            r.id,
            r.report,
            r.cen_keys,
            json_agg(t.*) AS traces
          FROM reports AS r
          INNER JOIN traces AS t
            ON t.trace_list_id = r.trace_list_id
          WHERE r.reported_at::date >= 
            AND r.verified = $2
            AND t.geohash = $3
            AND (
              SELECT (to_timestamp(t.start_time), to_timestamp(t.end_time))
              OVERLAPS (to_timestamp($4), to_timestamp($5))
            ) = true
          GROUP BY r.id, r.report, r.cen_keys
        `,
        [selectFromDate, verified, location.geohash, location.start, locations.end],
      ).then(r => r.rows).catch((err) => { next(new APIError(err.message)) })
      console.log('report', report)
      return report
    })
  }

  console.log('REPORT', reports)
  console.log('fromDate', fromDate)
  console.log('fromDateFormatted', moment.unix(fromDate).format())
  console.log('location', locations)
}
