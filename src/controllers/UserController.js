const User = require('../models/User')
const Participant = require('../models/Participant')
const Event = require('../models/Event')
const Token = require('../config/Token')
const Utils = require('../utils/utils')
const Msgs = require('../utils/messages')
const OB = 'User'
const OBJ = 'usuário'

module.exports = {
   async addUser(req, res) {
      try {
         //valida entradas
         let newUser = await Utils.validateInput(req, OB, false)
         if (newUser.validationMessage) {
            return Utils.retErr(res, newUser.validationMessage)
         }

         //verifica se já existe um user com o email
         let userExist = await User.findOne({ email: newUser.email })
         if (userExist) {
            return Utils.retErr(res, Msgs.msg(1, 'email', newUser.email, OBJ))
         }

         //cria usuário
         User.create(newUser, function(err, user) {
            if (err) {
               return Utils.retErr(res, Msgs.msg(2, 'inserir', OBJ, err.message))
            } else {
               return Utils.retOk(req, res, Utils.returnUser(user, false))
            }
         })
      } catch (err) {
         return Utils.retErr(res, Msgs.msg(3, 'addUser', err.message))
      }
   },

   async updateUsuario(req, res) {
      try {
         //valida as entradas
         let updtUser = await Utils.validateInput(req, OB, true)
         if (!updtUser.validationMessage) {
            return Utils.retErr(res, updtUser.validationMessage)
         }
         //valida se já existe user com o email
         let userExist = await User.findOne({ $and: [{ email: updtUser.email }, { idUser: { $ne: updtUser.id } }] })
         if (userExist) {
            return Utils.retErr(res, Msgs.msg(1, 'email'))
         }

         //atualiza user
         User.updateOne(
            { idUser: updtUser.idUser },
            {
               username: updtUser.username,
               email: updtUser.email,
               password: updtUser.password,
               birthdate: !updtUser.birthdate ? null : updtUser.birthdate,
               sex: !updtUser.sex ? null : updtUser.sex
            },
            {
               upsert: false
            },
            function(err, doc) {
               if (err) {
                  return Utils.retErr(res, Msgs.msg(2, 'atualizar', OBJ, err.message))
               } else if (doc.nModified === 0 && doc.n === 0) {
                  return Utils.retErr(res, Msgs.msg(5, OBJ, updtUser.idUser))
               } else {
                  return Utils.retOk(req, res, Utils.returnUser(updtUser, true))
               }
            }
         )
      } catch (err) {
         return Utils.retErr(res, Msgs.msg(3, 'updateUsuario', err.message))
      }
   },

   async getUserById(req, res) {
      try {
         //valida a entrada
         const { userId } = req.params
         if (!userId) {
            return Utils.retErr(res, Msgs.msg(3, OBJ))
         }

         //consulta user
         User.find({ idUser: userId }).exec((err, user) => {
            if (err) {
               return Utils.retErr(res, Msgs.msg(2, 'consultar', OBJ, err.message))
            } else if (user.length !== 0) {
               return Utils.retOk(req, res, Utils.returnUser(user[0], false))
            } else {
               return Utils.retErr(res, Msgs.msg(5, OBJ, userId))
            }
         })
      } catch (err) {
         return Utils.retErr(res, Msgs.msg(3, 'getUserById', err.message))
      }
   },

   async deleteUser(req, res) {
      try {
         const { userId } = req.params
         if (!userId) {
            return Utils.retErr(res, Msgs.msg(3, OBJ))
         }

         //consulta id do User
         let user = await User.findOne({ idUser: userId }, '_id')
         if (!user) {
            return Utils.retErr(res, Msgs.msg(5, OBJ, userId))
         }

         //verifica em participant se já existe algum event Vinculado
         //Caso exista bloqueia a exclusão
         let participants = await Participant.find({ userId: user._id }, '_id')
         if (participants.length > 0) {
            return Utils.retErr(res, Msgs.msg(11, OBJ, userId, 'Participant'))
         }

         //verifica em event se já existe algum user Vinculado como ownerId
         //Caso exista bloqueia a exclusão
         let events = await Event.find({ ownerId: user._id }, '_id')
         if (events.length > 0) {
            return Utils.retErr(res, Msgs.msg(11, OBJ, user, 'Event => (ownerId)'))
         }

         User.deleteOne({ idUser: userId }, function(err, doc) {
            if (err) {
               return Utils.retErr(res, Msgs.msg(2, 'remover', OBJ, err.message))
            } else if (doc.deletedCount === 0) {
               return Utils.retErr(res, Msgs.msg(5, OBJ, userId))
            } else {
               return Utils.retOk(req, res, { message: Msgs.msg(6, OBJ, userId) })
            }
         })
      } catch (err) {
         return Utils.retErr(res, Msgs.msg(3, 'deleteUser', err.message))
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
               return Utils.retErr(res, Msgs.msg(7, OBJ, auth.email))
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

   async getUsers(req, res) {
      try {
         User.find({}, { _id: false }).exec((err, users) => {
            if (err) {
               return Utils.retErr(res, 'Users searched failed!')
            }

            if (users.length === 0) {
               return Utils.retErr(res, `Nenhum usuário foi localizado.`)
            }

            users = Utils.replaceStr(users, ['idUser', 'T00:00:00.000Z'], ['id', ''])
            return Utils.retOk(req, res, users)
         })
      } catch (err) {
         return Utils.retErr(res, Msgs.msg(3, 'getUsers', err.message))
      }
   }
}
