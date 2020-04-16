const { ErrorHandler } = require('../modules/errors')


const _hasParams = target => (...params) => (req, _, next) => {
  for (const param of params) {
    if (!req[target][param]) {
      return next(new ErrorHandler(400, `Missing '${param}' in ${target}.`))
    }
  }
  return next()
}
module.exports.hasQueryParams = _hasParams('query')
module.exports.hasBodyParams = _hasParams('body')
