const serverless = require('serverless-http')
const express = require('express')

const root = require('./app')


const app = express()
const { STAGE = 'local', API_VER = 'local' } = process.env
app.get(`/${STAGE}`, (_, res) => res.json({ STAGE, API_VER }))
app.use(`/${STAGE}`, root)


module.exports.handler = serverless(app)
