const jwt = require('jsonwebtoken')
const authConfig = require('../config/auth')
const User = require('../models/User')
const Token = require('../config/Token')
const Utils = require('../utils/utils')
const Msgs = require('../utils/messages')
const OBJ = 'usuário'


module.exports = {

  // /me
  async auth(req, res) {
    try {
        const authHeader = req.headers.authorization
  
        if (!authHeader) {
          return Utils.retErr(res, 'Não foi fornecido token')
        }
  
        const parts = authHeader.split(' ')
  
        if (!parts.length === 2) {
          return Utils.retErr(res, 'O Formato do Token é inválido')
        }
  
        const [scheme, token] = parts
  
        if (!/^Bearer$/i.test(scheme)) {
          return Utils.retErr(res, 'O Formato do Token é inválido')
        }
  
        jwt.verify(token, authConfig.secret, (err, decoded) => {
           if (err) {
              return Utils.retErr(res, 'token inválido')
           }
           User.findById(decoded.idUser).exec(function(err, user) {
            if (err || !user) {
              return Utils.retErr(res, 'token inválido')
            }
            return Utils.retOk(req, res, user)
          })
        })
    } catch (err) {
      return res.status(400).json({ error: "User authentication failed" })
    }
  },


  async loginUser(req, res) {
    try {
      let auth = await Utils.validateInput(req, 'Login', false)
      if (auth.validationMessage) {
        return Utils.retErr(res, auth.validationMessage)
      }

      User.findOne({ email: auth.email }).exec(function(err, user) {
        if (err) {
          return Utils.retErr(res, Msgs.msg(2, 'consultar', OBJ, err.message))
        }
        if (!user) {
          return Utils.retErr(res, Msgs.msg(7, 'email', auth.email, OBJ))
        }
        if (!(auth.password === user.password)) {
          return Utils.retErr(res, `Senha incorreta`)
        }
        return Utils.retOk(req, res, { token: Token.generateToken({ idUser: user._id }) })
      })
    } catch (err) {
      return Utils.retErr(res, Msgs.msg(3, 'loginUser', err.message))
    }
  },
}