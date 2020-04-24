const express = require('express')
const { postReportReq, postReport } = require('@eqworks/cen-node')
const { hasQueryParams } = require('../middleware/validation')
const jwtAuth = require('../middleware/auth')
const validateTCNReport = require('../middleware/validate-tcn-report')
const saveReport = require('../middleware/save-report')
const getReports = require('../middleware/get-reports')


const router = express.Router()
module.exports = (db) => {
  router.post('/', jwtAuth, postReportReq, postReport, validateTCNReport, saveReport(db))
  router.get('/', jwtAuth, hasQueryParams('verified', 'locations'), getReports(db))
  return router
}
