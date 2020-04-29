const express = require('express')
const jwtAuth = require('../middleware/auth')
const { appendTCNReport, validateTCNReport } = require('../middleware/validate-tcn-report')
const saveReport = require('../middleware/save-report')
const getReports = require('../middleware/get-reports')


const router = express.Router()
module.exports = {
  CENReport(req, res) {
    res.status(400).send('CEN protocol not supported, please use TCN instead (/tcnreport).')
  },
  TCNReport(db) {
    router.post('/', jwtAuth, appendTCNReport, validateTCNReport, saveReport(db))
    router.get('/', jwtAuth, getReports(db))
    return router
  },
}
