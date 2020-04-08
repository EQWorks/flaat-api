const express = require('express')
const config = require('../config')
const { Pool } = require('pg')

const login = require('./routes/login')
const checkAuth = require('./routes/test-checkAuth')


const db = new Pool(config.db)
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/login', login(db))
app.use('/checkAuth', checkAuth())

module.exports = app
