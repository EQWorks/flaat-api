const jwt = require('jsonwebtoken')
const Moment = require('moment')
const MomentRange = require('moment-range')
const { APIError } = require('../modules/errors')


const moment = MomentRange.extendMoment(Moment)
module.exports = db => async (req, res, next) => {
  // TODO: if null --> get the entire record of reports with no filtering
  //  --> separate by date and location tho
  const { verified, fromDate } = req.query
  const { locations } = req.body
  const selectFromDate = moment.unix(fromDate).format()
  // let reports

  // // APPROACH-1
  // if (!fromDate) {
  //   reports = await db.query(
  //     `
  //       SELECT
  //         r.report,
  //         r.cen_keys,
  //         t.trace_history
  //       FROM reports AS r
  //       INNER JOIN traces AS t
  //         ON r.trace_id = t.id
  //       WHERE r.verified = $1
  //     `,
  //     [verified],
  //   )
  //     .then(r => r.rows)
  //     .catch(err => next(new APIError(`Failed to fetch reports. ${err.message}`)))
  // } else {
  //   reports = await db.query(
  //     `
  //       SELECT
  //         r.report,
  //         r.cen_keys,
  //         t.trace_history
  //       FROM reports AS r
  //       INNER JOIN traces AS t
  //         ON r.trace_id = t.id
  //       WHERE reported_at::date >= $1 AND verified = $2
  //     `,
  //     [selectFromDate, verified],
  //   )
  //     .then(r => r.rows)
  //     .catch(err => next(new APIError(`Failed to fetch reports. ${err.message}`)))
  // }

  // saved with APPROACH-2
  // PROBLEM: `overlaps` dn match same day
  const reports = locations.map(async (location) => {
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
        WHERE r.reported_at::date >= $1
          AND r.verified = $2
          AND t.geohash = $3
          AND (
            tstzrange(to_timestamp(t.start_time), to_timestamp(t.end_time), '[]')
            && tstzrange(to_timestamp($4), to_timestamp($5), '[]')
          ) = true
        GROUP BY r.id, r.report, r.cen_keys
      `,
      [selectFromDate, verified, location.geohash, location.start, locations.end],
    ).then(r => r.rows).catch((err) => { next(new APIError(err.message)) })
    console.log('report', report)
    return report
  })


  console.log('REPORT:', reports)
  // console.log('fromDate', fromDate)
  // console.log('fromDateFormatted', moment.unix(fromDate).format())
  // console.log('location', locations)
}
