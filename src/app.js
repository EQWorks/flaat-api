const express = require('express')
const config = require('../config')
const { Pool } = require('pg')

const registerApp = require('./routes/app-register')
const validationPin = require('./routes/validation-pin')
const login = require('./routes/login')
const { CENReport, TCNReport } = require('./routes/tcn-report')
const version = require('./routes/version')
const { ErrorHandler } = require('./modules/errors')


const db = new Pool(config.db)
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/login', login(db))
app.use('/tcnreport', TCNReport(db))
app.use('/cenreport', CENReport)
app.use('/version', version())

// likely don't need this endpoint, will manually onboard new apps for now
app.use('/register', registerApp(db))
// endpoint for HA to create validation pin for distribution
app.use('/pin', validationPin(db))

app.use(ErrorHandler)

module.exports = app
