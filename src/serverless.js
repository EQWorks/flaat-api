const serverless = require('serverless-http')
const express = require('express')
const cors = require('cors')

const root = require('./app')


const { STAGE = 'local', API_VER = 'local' } = process.env
const app = express()
app.use(cors())
app.get(`/${STAGE}`, (_, res) => res.json({ STAGE, API_VER }))
app.use(`/${STAGE}`, root)


module.exports.handler = serverless(app)
