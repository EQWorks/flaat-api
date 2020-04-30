module.exports = db => async (req, res, next) => {
  try {
    // Must sanitize all input first (see sanitize-get-reports middleware fn)
    const { verified, fromDate, locations, fullReport } = req.query

    // Init where clause with verified
    const whereText = ['r.verified = $1']
    const whereValues = [verified]

    // Add locations to where clause if provided
    if (locations.length) {
      const geoFilter = locations
        .map((_, i) => `t.geohash LIKE $${i + 1 + whereValues.length} || '%'`)
        .join(' OR ')

      whereText.push(`(
        r.trace_list_id IS NULL OR EXISTS(
          SELECT * FROM traces t
          WHERE t.trace_list_id = r.trace_list_id
          AND (${geoFilter})
        )
      )`)
      whereValues.push(...locations)
    }

    // Add date to where clause if provided
    if (fromDate !== '1970-01-01T00:00:00Z') {
      whereText.push(`r.reported_at::date >= $${whereValues.length + 1}`)
      whereValues.push(fromDate)
    }

    const { rows: queryReports } = await db.query({
      text: `
        SELECT DISTINCT r.report, r.signature FROM reports r
        WHERE ${whereText.join(' AND ')}
      `,
      values: whereValues,
      rowMode: 'array',
    })

    const reports = queryReports.map(([report, signature]) => {
      if (fullReport) {
        const reportBuffer = Buffer.from(report, 'base64')
        const signatureBuffer = Buffer.from(signature, 'base64')
        return Buffer.concat([reportBuffer, signatureBuffer]).toString('base64')
      }
      return report
    })

    res.json({ reports })
  } catch (err) {
    return next(err)
  }
}
