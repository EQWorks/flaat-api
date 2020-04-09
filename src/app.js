const express = require('express')
const config = require('../config')
const { Pool } = require('pg')

const login = require('./routes/login')
const cenReport = require('./routes/cen_report')


const db = new Pool(config.db)
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/login', login(db))
app.use('/cenreport', cenReport(db))

module.exports = app
