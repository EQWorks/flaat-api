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
 * @returns {string} UTC timestamp in format if parseable, '1970-01-01T00:00:00Z' otherwise
 */
const sanitizeUnixTS = (rawDate) => {
  if (!rawDate) return '1970-01-01T00:00:00Z'
  const parsedDate = moment.unix(rawDate).utc().format()
  return parsedDate === 'Invalid date' ? '1970-01-01T00:00:00Z' : parsedDate
}

/**
 * Parses date string to Unix timestamp
 * @param {string|number} [rawDate] Date formatted as 'YYY-MM-DD'
 * @returns {string} UTC timestamp in format if parseable, '1970-01-01T00:00:00Z' otherwise
 */
const sanitizeDate = (rawDate) => {
  if (!rawDate) return '1970-01-01T00:00:00Z'
  const parsedDate = moment(rawDate, 'YYYY-MM-DD').utc().format()
  return parsedDate === 'Invalid date' ? '1970-01-01T00:00:00Z' : parsedDate
}

/**
 * Parses string to boolean
 * @param {string} [rawBoolean]
 * @returns {boolean} true for truthy values (save for string 'false'), false otherwise
 */
const sanitizeBoolean = rawBoolean => rawBoolean !== 'false' && Boolean(rawBoolean)

/**
 * Parses string to integer
 * @param {string} [rawInt]
 * @returns {number} Integer if parseable and positive, 0 otherwise
 */
const sanitizeUInt = (rawInt) => {
  if (!rawInt) return 0
  // eslint-disable-next-line radix
  const parsedInt = Number.parseInt(rawInt, 10)
  return Number.isNaN(parsedInt) || parsedInt < 0 ? 0 : parsedInt
}

/**
 * Parses CoEpi query parameters
 * @param {string} [date]
 * @param {string} [intervalNumber]
 * @param {string} [intervalLengthMs]
 * @returns {([string, string]|[string, undefined])} [fromDate, toDate] with 24 hours separating
 * both dates, ['1970-01-01T00:00:00Z', '1970-01-01T00:00:00Z'] if not parseable
 */
const sanitizeCoEpiQuery = (date, intervalNumber, intervalLengthMs) => {
  const safeIntervalNumber = sanitizeUInt(intervalNumber)
  const safeIntervalLengthMs = sanitizeUInt(intervalLengthMs)
  let fromDate
  let toDate

  if (safeIntervalNumber && safeIntervalLengthMs) {
    fromDate = sanitizeUnixTS((safeIntervalNumber - 1) * safeIntervalLengthMs / 1000)
    toDate = sanitizeUnixTS(safeIntervalNumber * safeIntervalLengthMs / 1000)
  } else {
    fromDate = sanitizeDate(date)
    toDate = fromDate === '1970-01-01T00:00:00Z'
      ? fromDate
      : moment(fromDate).add(1, 'd').utc().format()
  }

  return [fromDate, toDate]
}

module.exports = (req, _, next) => {
  const {
    verified = 'true', fromDate, toDate, locations, fullReport = 'false',
    date, intervalNumber, intervalLengthMs, // CoEpi
  } = req.query

  req.query.verified = sanitizeBoolean(verified) // default: true
  req.query.fullReport = sanitizeBoolean(fullReport) // default: false
  req.query.fromDate = sanitizeUnixTS(fromDate)
  req.query.toDate = sanitizeUnixTS(toDate)
  req.query.locations = sanitizeStringArray(locations)

  // CoEpi params - for interoperability
  // https://github.com/Co-Epi/coepi-backend-aws/blob/master/api_definition/coepi_api_0.4.0.yml
  if (req.query.fromDate === '1970-01-01T00:00:00Z') {
    [req.query.fromDate, req.query.toDate] =
      sanitizeCoEpiQuery(date, intervalNumber, intervalLengthMs)
  }
  next()
}
