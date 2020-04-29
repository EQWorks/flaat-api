const {
  checkReportLength,
  checkReportIndexes,
  checkReportSignature,
} = require('../modules/tcn-helpers')
const { ErrorHandler } = require('../modules/errors')


const appendTCNReport = (req, res, next) => {
  // check if application/json or just text
  if (req.is('json')) {
    if (!req.body.report) {
      return next(new ErrorHandler(400, 'Missing \'report\' field in json payload'))
    }
    req._tcn = req.body.report
    return next()
  }
  req._tcn = req.body
  return next()
}

const validateTCNReport = (req, _, next) => {
  try {
    // report max length: 389 bytes
    if (req._tcn.length > 389 * 8 / 6) {
      throw Error('Report is too long.')
    }

    const buffer = Buffer.from(req._tcn, 'base64')
    checkReportLength(buffer)
    checkReportIndexes(buffer)
    checkReportSignature(buffer)

    // append signature + unsigned report - base64
    req._tcn = buffer.slice(0, -64).toString('base64')
    req._tcnSignature = buffer.slice(-64).toString('base64')
  } catch (err) {
    return next(new ErrorHandler(400, 'Invalid report submission.'))
  }
  next()
}

module.exports = {
  appendTCNReport,
  validateTCNReport,
}
