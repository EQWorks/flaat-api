const { Router, text } = require('express')
const jwtAuth = require('../middleware/auth')
const { appendTCNReport, validateTCNReport } = require('../middleware/validate-tcn-report')
const saveReport = require('../middleware/save-report')
const sanitizeGetInput = require('../middleware/sanitize-get-reports')
const getReports = require('../middleware/get-reports')


// middleware fn to parse plain text submissions (base 64 encoded)
const parseTextBody = text({ defaultCharset: 'iso-8859-1', limit: 389, type: 'text/plain' })

module.exports = {
  CENReport(req, res) {
    res.status(400).send('CEN protocol not supported, please use TCN instead (/tcnreport).')
  },
  TCNReport(db) {
    const router = Router()
    router.post('/', jwtAuth, parseTextBody, appendTCNReport, validateTCNReport, saveReport(db))
    router.get('/', jwtAuth, sanitizeGetInput, getReports(db))
    return router
  },
}
