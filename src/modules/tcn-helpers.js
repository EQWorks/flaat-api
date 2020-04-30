const crypto = require('crypto')


const RVKHeader = Buffer.from('MCowBQYDK2VwAyEA', 'base64')

/**
 * Checks report length
 * Throws an error if the check fails, returns a boolean otherwise
 * @param {Buffer} buffer Report as a buffer
 * @param {boolean} [requireSignature=true] Function will throw an error
 * when passed an unsigned report (instead of returning false)
 * @returns {boolean} true if the report is signed, false otherwise
 */
const checkReportLength = (buffer, requireSignature = true) => {
  if (buffer.length < 70 || (requireSignature && buffer.length < 134)) {
    throw Error('Report is too short.')
  }

  // Memo len - 1 byte
  const memoLen = buffer.readUInt8(69)

  // unsigned report
  if (buffer.length !== 134 + memoLen) {
    if (buffer.length !== 70 + memoLen || requireSignature) {
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

module.exports = {
  checkReportIndexes,
  checkReportLength,
  checkReportSignature,
}
