const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Token = require('../config/Token')
const Utils = require('../utils/utils')
const Msgs = require('../utils/messages')
const OBJ = 'usuário'


module.exports = {

  async loginUser(req, res) {
    try {
      if (req.route.path && req.method){
         console.log(`Nova requisição: ${req.route.path} => ${req.method}`)
      }
      
      console.log('Corpo da requisição')
      console.log(req.body)
      
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
        return Utils.retOk(req, res, { 
          token: Token.generateToken({ idUser: user.idUser }), 
          user: Utils.returnUser(user)
        })
      })
    } catch (err) {
      return Utils.retErr(res, Msgs.msg(3, 'loginUser', err.message))
    }
  },
}