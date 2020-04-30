const { Router } = require('express')
const jwtAuth = require('../middleware/auth')
const { appendTCNReport, validateTCNReport } = require('../middleware/validate-tcn-report')
const saveReport = require('../middleware/save-report')
const sanitizeGetInput = require('../middleware/sanitize-get-reports')
const getReports = require('../middleware/get-reports')


module.exports = {
  CENReport(req, res) {
    res.status(400).send('CEN protocol not supported, please use TCN instead (/tcnreport).')
  },
  TCNReport(db) {
    const router = Router()
    router.post('/', jwtAuth, appendTCNReport, validateTCNReport, saveReport(db))
    router.get('/', jwtAuth, sanitizeGetInput, getReports(db))
    return router
  },
}
