const jwt = require('jsonwebtoken')
const authConfig = require('../config/auth')

module.exports = async (req, res, next) => {
   try {
      const authHeader = req.headers.token

      if (!authHeader) {
         return res.status(400).send({ message: 'Não foi fornecido um token' })
      }

      // const parts = authHeader.split(' ')

      // if (!parts.length === 2) {
      //    return res.status(403).send({ error: 'Token error' })
      // }

      // const [scheme, token] = parts

      // if (!/^Bearer$/i.test(scheme)) {
      //    return res.status(403).send({ error: 'Token malformatted' })
      // }

      jwt.verify(authHeader, authConfig.secret, (err, decoded) => {
         if (err) {
            return res.status(403).send({ error: 'Token inválido' })
         }
         console.log('Token Recebido')
         console.log('Corpo da requisição')
         console.log(req.body)
         //id MongoDB do usuário dono do Token
         req.body.idUser = decoded.idUser
         return next()
      })
   } catch (error) {
      return res.status(403).json({ error: 'Authentication failed' })
   }
}
