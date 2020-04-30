const DEFAULT_IN_VERIFIED = 'true' // only respond with verified reports
const DEFAULT_IN_FULL_REPORT = 'false' // do not send signature
const COEPI_INTERVAL_LENGTH_S = 6 * 3600 // 6 hours

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
    const trimmedValues = parsedArray.reduce((trimmedValues, value) => {
      if (typeof value === 'string') {
        const trimmedValue = value.trim()
        if (trimmedValue) {
          trimmedValues.push(trimmedValue)
        }
      }
      return trimmedValues
    }, [])

    // remove duplicates
    return [...new Set(trimmedValues)]
  } catch (_) {
    return []
  }
}

/**
 * Parses date string to Unix time
 * @param {string|number} [rawDate] Date formatted as 'YYY-MM-DD'
 * @returns {number} Unix time, 0 if not parseable
 */
const sanitizeDate = (rawDate) => {
  if (!rawDate || !(/^\d{4}-\d{2}-\d{2}$/).test(rawDate)) return 0
  return Math.floor(Date.parse(rawDate) / 1000)
}

/**
 * Parses string to boolean
 * @param {string} [rawBoolean]
 * @returns {boolean} true is passed string 'true', false otherwise
 */
const sanitizeBoolean = rawBoolean => rawBoolean === 'true'

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
 * @returns {[number, number]} [fromDate, toDate] as unix time
 * with COEPI_INTERVAL_LENGTH_S (when intervalNumber can be coerced into a valid positive
 * integer) or 24 hours separating both times, [0, 0] if not parseable
 */
const sanitizeCoEpi = (date, intervalNumber) => {
  const safeIntervalNumber = sanitizeUInt(intervalNumber)
  let fromDate
  let toDate

  // interval imput supersedes date as more precise
  if (safeIntervalNumber) {
    fromDate = (safeIntervalNumber - 1) * COEPI_INTERVAL_LENGTH_S
    toDate = safeIntervalNumber * COEPI_INTERVAL_LENGTH_S
  } else {
    fromDate = sanitizeDate(date)
    toDate = fromDate && fromDate + (3600 * 24)
  }

  return [fromDate, toDate]
}

module.exports = (req, _, next) => {
  const {
    verified = DEFAULT_IN_VERIFIED,
    fromDate,
    toDate,
    locations,
    fullReport = DEFAULT_IN_FULL_REPORT,
    date, // CoEpi
    intervalNumber, // CoEpi
  } = req.query

  req.query.verified = sanitizeBoolean(verified)
  req.query.fullReport = sanitizeBoolean(fullReport)
  req.query.fromDate = sanitizeUInt(fromDate)
  req.query.toDate = sanitizeUInt(toDate)
  req.query.locations = sanitizeStringArray(locations)

  // CoEpi params - for interoperability
  // Used as fallback if fromDate not provided
  // https://github.com/Co-Epi/coepi-backend-aws/blob/master/api_definition/coepi_api_0.4.0.yml
  if (!req.query.fromDate) {
    [req.query.fromDate, req.query.toDate] =
      sanitizeCoEpi(date, intervalNumber)
  }
  next()
}
