const express = require('express')
const config = require('../config')
const { Pool } = require('pg')

const login = require('./routes/login')
const cenReport = require('./routes/cen_report')
const { catchAllError } = require('./modules/errors')


const db = new Pool(config.db)
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/login', login(db))
app.use(['/tcnreport', '/cenreport'], cenReport(db))

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  catchAllError(err, res)
})

module.exports = app
