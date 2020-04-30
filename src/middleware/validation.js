const { APIError } = require('../modules/errors')


const _hasParams = target => (...params) => (req, _, next) => {
  for (const param of params) {
    if (!(param in req[target])) {
      return next(new APIError(400, `Missing '${param}' in ${target}.`))
    }
  }
  return next()
}
module.exports.hasQueryParams = _hasParams('query')
module.exports.hasBodyParams = _hasParams('body')
