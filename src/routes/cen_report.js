const express = require('express')
const { postCENReportReq, postCENReport } = require('@eqworks/cen-node')
const saveReport = require('../middleware/save-report')
const jwtAuth = require('../middleware/auth')


const router = express.Router()
module.exports = (db) => {
  router.post('/', jwtAuth, postCENReportReq, postCENReport, saveReport(db), (_, res) => {
    try {
      res.send('Successful upload.')
    } catch (err) {
      res.status(400).send('Unsucessful upload.')
    }
  })

  // router.get('/')
  return router
}
