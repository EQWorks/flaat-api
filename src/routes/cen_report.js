const express = require('express')
const { postCENReportReq, postCENReport } = require('@eqworks/cen-node')
const jwtAuth = require('../middleware/auth')
const errorHandler = require('../middleware/error-handler')
const saveReport = require('../middleware/save-report')
const getReports = require('../middleware/get-reports')


const router = express.Router()
module.exports = (db) => {
  router.post(
    '/',
    jwtAuth,
    postCENReportReq,
    postCENReport,
    saveReport(db),
    errorHandler,
    (_, res) => { res.send('Successful upload.') },
  )

  router.get(
    '/',
    jwtAuth,
    getReports(db),
    errorHandler,
    (req, res) => {
      const { reports } = req
      res.status(200).json({ reports })
    },
  )
  return router
}
