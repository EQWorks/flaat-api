const express = require('express')
const { postCENReportReq, postCENReport } = require('@eqworks/cen-node')
const jwtAuth = require('../middleware/auth')
const saveReport = require('../middleware/save-report')
const getReports = require('../middleware/get-reports')


const router = express.Router()
module.exports = (db) => {
  router.post('/', jwtAuth, postCENReportReq, postCENReport, saveReport(db))

  router.get('/', jwtAuth, getReports(db), (req, res) => {
    const { reports } = req
    res.status(200).json({ reports })
  })
  return router
}
