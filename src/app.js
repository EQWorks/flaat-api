const express = require('express')
const cors = require('cors')
const config = require('../config')
const { Pool } = require('pg')

const register = require('./routes/register')


const db = new Pool(config.db)
const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/register', register(db))

module.exports = app
