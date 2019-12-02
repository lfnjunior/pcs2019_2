const jwt = require('jsonwebtoken')
const authConfig = require('../config/auth')

module.exports = async (req, res, next) => {
   try {
      const authHeader = req.headers.token

      if (!authHeader) {
         return res.status(400).send({ message: 'Não foi fornecido um token' })
      }

      if (req.route.path && req.method){
         console.log(`Nova requisição: ${req.route.path} => ${req.method}`)
      }

      jwt.verify(authHeader, authConfig.secret, (err, decoded) => {
         if (err) {
            return res.status(403).send({ error: 'Token inválido' })
         }
         console.log('Token Recebido')
         if (req.body == {}){
            console.log('Requisição sem body')
         } else {
            console.log('Corpo da requisição')
            console.log(req.body)
         }
         //id do usuário dono do Token
         req.body.idUser = decoded.idUser
         return next()
      })
   } catch (error) {
      return res.status(403).json({ error: 'Authentication failed' })
   }
}
