const express = require('express')
const config = require('../config')
const { Pool } = require('pg')

const register = require('./routes/register')


const db = new Pool(config.db)
const app = express()
app.use(express.json())
app.use(express.urlencoded())

app.use('/register', register(db))

module.exports = app
