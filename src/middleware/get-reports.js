const moment = require('moment')


module.exports = db => async (req, res, next) => {
  // ASSUME: always specify location & verification
  const { verified, fromDate } = req.query
  const { locations } = req.body
  const selectFromDate = moment.unix(fromDate).format()
  let reports

  if (fromDate) {
    reports = await db.query(
      `
        SELECT id, report, cen_keys, trace_list_id
        FROM reports
        WHERE reported_at::date >= $1
          AND verified = $2
      `,
      [selectFromDate, verified],
    ).then(r => r.rows).catch(next)
  } else {
    reports = await db.query(
      `
        SELECT id, report, cen_keys, trace_list_id
        FROM reports
        WHERE verified = $1
      `,
      [verified],
    ).then(r => r.rows).catch(next)
  }

  Promise.all(reports.map(async (report) => {
    const finalReport = {}
    const geoList = await Promise.all(locations.map(location => (
      db.query(
        `
          SELECT geohash, start_time, end_time FROM traces
          WHERE trace_list_id = $1
            AND geohash = $2
            AND (
              tstzrange(to_timestamp(start_time), to_timestamp(end_time), '[]')
              && tstzrange(to_timestamp($3), to_timestamp($4), '[]')
            ) = true
        `,
        [report.trace_list_id, location.geohash, location.start, location.end],
      ).then(r => r.rows)
    ))).then(r => r.filter(list => list.length > 0).flat()).catch(next)

    finalReport.id = report.id
    finalReport.report = report.report
    if (report.cen_keys.length > 0) finalReport.cen_keys = report.cen_keys
    // ASSUME: still want reports without traces arr
    if (geoList.length > 0) finalReport.traces = geoList

    return finalReport
  })).then(reports => res.json({ reports })).catch(next)
}
