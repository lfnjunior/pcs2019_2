const jwt = require("jsonwebtoken")
const authConfig = require('./auth')

module.exports = {
    generateToken(params) {
        return jwt.sign( params , authConfig.secret , { expiresIn: '4h' })         
    }
}