const jwt = require("jsonwebtoken")
const authConfig = require('./auth')
const bcrypt = require('bcrypt')

module.exports = {
    generateToken(params) {
        return jwt.sign( params , authConfig.secret , { expiresIn: '4h' })         
    },
    compareHash(hash, password) {
      return bcrypt.compare(hash, password);
    }
}