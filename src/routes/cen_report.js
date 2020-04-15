const express = require('express')
const { postCENReportReq, postCENReport } = require('@eqworks/cen-node')
const { hasBodyParams, hasQueryParams } = require('../middleware/validation')
const jwtAuth = require('../middleware/auth')
const saveReport = require('../middleware/save-report')
const getReports = require('../middleware/get-reports')


const router = express.Router()
module.exports = (db) => {
  router.post('/', jwtAuth, postCENReportReq, postCENReport, saveReport(db))
  router.get('/', jwtAuth, hasBodyParams('locations'), hasQueryParams('verified'), getReports(db))
  return router
}
