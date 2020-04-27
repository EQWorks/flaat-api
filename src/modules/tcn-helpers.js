const crypto = require('crypto')


const RVKHeader = Buffer.from('MCowBQYDK2VwAyEA', 'base64')

/**
 * Checks report length
 * Throws an error if the check fails, returns a boolean otherwise
 * @param {Buffer} buffer Report as a buffer
 * @returns {boolean} true if the report is signed, false otherwise
 */
const checkReportLength = (buffer) => {
  if (buffer.length < 70) {
    throw Error('Report is too short.')
  }

  // Memo len - 1 byte
  const memoLen = buffer.readUInt8(69)

  // unsigned report
  if (buffer.length !== 134 + memoLen) {
    if (buffer.length !== 70 + memoLen) {
      throw Error('Report length is invalid.')
    }
    return false
  }

  return true
}

/**
 * Checks report indexes
 * Throws an error if the check fails, returns a boolean otherwise
 * @param {Buffer} buffer Report as a buffer
 * @returns {boolean} true if the check passes
 */
const checkReportIndexes = (buffer) => {
  const startIndex = buffer.readUInt16LE(64)
  const endIndex = buffer.readUInt16LE(66)
  if (startIndex < 1 || startIndex > endIndex) {
    throw Error('Invalid indexes in report.')
  }
  return true
}

/**
 * Checks report signature
 * Throws an error if the check fails, returns a boolean otherwise
 * @param {Buffer} buffer Report as a buffer
 * @returns {boolean} true if the check passes
 */
const checkReportSignature = (buffer) => {
  // RVK - first 32 bytes
  const RVK = buffer.slice(0, 32)

  // build key obj from RVK buffer
  const key = crypto.createPublicKey({
    key: Buffer.concat([RVKHeader, RVK]),
    format: 'der',
    type: 'spki',
  })

  const report = buffer.slice(0, -64)
  // Signature - trailing 64 bytes
  const signature = buffer.slice(-64)

  if (!crypto.verify(null, report, key, signature)) {
    throw Error('Mismatch between signature and report.')
  }
  return true
}

/**
 * Performs integrity checks
 * Throws an error if a check fails, returns a boolean otherwise
 * @param {string} report Report encoded as a base64 string
 * @returns {boolean} true if the report is signed, false otherwise
 */
const checkReportIntegrity = (report) => {
  // report max length: 389 bytes
  if (report.length > 389 * 8 / 6) {
    throw Error('Report is too long.')
  }

  const buffer = Buffer.from(report, 'base64')
  const isSigned = checkReportLength(buffer)
  checkReportIndexes(buffer)
  if (isSigned) {
    checkReportSignature(buffer)
    return true
  }

  return false
}

module.exports = {
  checkReportIntegrity,
  checkReportIndexes,
  checkReportLength,
  checkReportSignature,
}
