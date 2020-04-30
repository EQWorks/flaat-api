const moment = require('moment')

/**
 * Parses json string to array of strings
 * Removes padding, empty items and duplicates
 * @param {string} [rawArray]
 * @returns {Array<string>}
 */
const sanitizeStringArray = (rawArray) => {
  if (!rawArray) return []
  try {
    const parsedArray = JSON.parse(rawArray)
    if (!Array.isArray(parsedArray)) return []

    // remove padding, empty strings and non-strings
    const trimmedValue = parsedArray.reduce((trimmedValues, value) => {
      if (typeof value === 'string') {
        const trimmedValue = value.trim()
        if (trimmedValue) {
          trimmedValues.push(trimmedValue)
        }
      }
      return trimmedValues
    }, [])

    // remove duplicates
    return [...new Set(trimmedValue)]
  } catch (_) {
    return []
  }
}

/**
 * Parses string/number to Unix timestamp
 * @param {string|number} [rawDate] Seconds since Unix Epoch (UTC)
 * @returns {string} UTC Timestamp 'YYYY-MM-DDThh:mm:ssZ
 */
const sanitizeUnixTS = (rawDate) => {
  if (!rawDate) return '1970-01-01T00:00:00Z'
  const parsedDate = moment.unix(rawDate).utc().format()
  return parsedDate === 'Invalid date' ? '0' : parsedDate
}

/**
 * Parses string to boolean
 * @param {string} [rawBoolean]
 * @returns {boolean} true for truthy values (save for string 'false'), false otherwise
 */
const sanitizeBoolean = (rawBoolean) => {
  return rawBoolean && rawBoolean !== 'false'
}

module.exports = (req, _, next) => {
  const { verified, fromDate, locations, fullReport } = req.query
  req.query.verified = sanitizeBoolean(verified)
  req.query.fullReport = sanitizeBoolean(fullReport)
  req.query.fromDate = sanitizeUnixTS(fromDate)
  req.query.locations = sanitizeStringArray(locations)
  next()
}
