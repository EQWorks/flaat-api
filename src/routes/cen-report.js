const express = require('express')
const { postReportReq, postReport } = require('@eqworks/cen-node')
const { hasBodyParams, hasQueryParams } = require('../middleware/validation')
const jwtAuth = require('../middleware/auth')
const saveReport = require('../middleware/save-report')
const getReports = require('../middleware/get-reports')


const router = express.Router()
module.exports = (db) => {
  router.post('/', jwtAuth, postReportReq, postReport, saveReport(db))
  router.get('/', jwtAuth, hasBodyParams('locations'), hasQueryParams('verified'), getReports(db))
  return router
}
