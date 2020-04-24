const { checkReportIntegrity } = require('../modules/tcn-helpers')
const { ErrorHandler } = require('../modules/errors')


module.exports = (req, _, next) => {
  const { report, ver } = req._cen
  if (ver !== 'v4') {
    // move on to next middleware function if CEN (v3)
    return next()
  }
  try {
    // throws an error if report is compromised/invalid
    checkReportIntegrity(report)
  } catch (err) {
    return next(new ErrorHandler(400, 'Invalid report submission.'))
  }
  next()
}
