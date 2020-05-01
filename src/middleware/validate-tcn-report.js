const { text } = require('express')
const {
  checkReportLength,
  checkReportIndexes,
  checkReportSignature,
} = require('../modules/tcn-helpers')
const { APIError } = require('../modules/errors')


// Max 389 bytes (report || signature)
const MAX_PAYLOAD_LENGTH_B64 = Math.ceil(389 / 3) * 4

// middleware fn to parse plain text submissions (base 64 encoded)
const parseTextBody = text({
  defaultCharset: 'iso-8859-1',
  limit: MAX_PAYLOAD_LENGTH_B64,
  type: 'text/plain',
})


const appendTCNReport = (req, res, next) => {
  // application/json
  if (req.is('json')) {
    if (!req.body.report) {
      return next(new APIError(400, 'Missing \'report\' field in json payload.'))
    }
    req._tcn = req.body.report
    return next()
  }

  // text/plain
  if (req.is('text/plain')) {
    req._tcn = req.body
    return next()
  }

  // else error
  next(new APIError(400, 'Payload must be of type application/json or text/plain.'))
}

const validateTCNReport = (req, _, next) => {
  try {
    // report max length: 389 bytes
    if (req._tcn.length > MAX_PAYLOAD_LENGTH_B64) {
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
    return next(new APIError(400, 'Invalid report submission.'))
  }
  next()
}

module.exports = {
  parseTextBody,
  appendTCNReport,
  validateTCNReport,
}
