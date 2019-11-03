const jwt = require('jsonwebtoken')
const authConfig = require('../config/auth')

module.exports = async (req, res, next) => {
   try {
      const authHeader = req.headers.authorization

      if (!authHeader) {
         return res.status(403).send({ error: 'No token provided' })
      }

      const parts = authHeader.split(' ')

      if (!parts.length === 2) {
         return res.status(403).send({ error: 'Token error' })
      }

      const [scheme, token] = parts

      if (!/^Bearer$/i.test(scheme)) {
         return res.status(403).send({ error: 'Token malformatted' })
      }

      jwt.verify(token, authConfig.secret, (err, decoded) => {
         if (err) {
            return res.status(403).send({ error: 'Token invalid' })
         }
         return next()
      })
   } catch (error) {
      return res.status(403).json({ error: 'Authentication failed' })
   }
}
