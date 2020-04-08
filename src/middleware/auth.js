const jwt = require('jsonwebtoken')


const jwtAuth = (req, _, next) => {
  // DEPRECATED `x-firstorder-token`
  const uJWT = req.get('eq-api-jwt') || req.get('x-firstorder-token')

  // quick validation
  if (!(req.headers && uJWT && uJWT.length > 0)) {
    return next(apiError('Invalid JWT', 401))
  }

  const {
    email = '',
    api_access = {},
    prefix,
  } = jwt.decode(uJWT)

  const { write = 0, read = 0 } = api_access
  let { wl: whitelabel = 0, customers = 0 } = api_access

  // both are integers
  const { _wl, _customer } = req.query
  const wlID = parseInt(_wl)
  const cuID = parseInt(_customer)
  // validate _wl and _customer
  if (_wl && wlID && (!_customer || cuID)) {
    const isInternal = whitelabel === -1 && customers === -1
    if (isInternal || whitelabel.includes(_wl)) {
      whitelabel = [wlID]
    }

    if (_customer && (isInternal ||
      (whitelabel.includes(wlID) && (customers === -1 || customers.includes(cuID)))
    )) {
      customers = [cuID]
    }
  }

  req.access = { whitelabel, customers, write, read, email, prefix }

  axios({
    url: `${KEY_WARDEN_BASE}/confirm`,
    method: 'get',
    headers: { 'eq-api-jwt': uJWT },
    params: { light: 1 },
  }).then(() => next()).catch(next)
}

module.exports = jwtAuth
