const crypto = require('crypto')
const bcrypt = require('bcrypt')


const randomString = (length = 32) => crypto.randomBytes(length / 2).toString('hex')

const hash = data => bcrypt.hashSync(data, 10)

const compareHash = (data, hashed) => bcrypt.compareSync(data, hashed)

module.exports = {
  randomString,
  hash,
  compareHash,
}
