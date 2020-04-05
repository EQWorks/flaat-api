const express = require('express')
const cors = require('cors')
const config = require('../config')
const { Pool } = require('pg')

const register = require('./routes/register')


const { STAGE = 'local', API_VER = 'local' } = process.env
const db = new Pool(config.db)
const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (_, res) => res.json({ STAGE, API_VER }))
app.use('/register', register(db))

module.exports = app
