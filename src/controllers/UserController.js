const User = require('../models/User')
const Token = require('../config/Token')
const Utils = require('../utils/utils')
const Msgs = require('../utils/messages')
const OB = 'User'
const OBJ = 'usuário'

module.exports = {
   async addUser(req, res) {
      try {
         let newUser = await Utils.validateInput(req, OB, false)
         if (!newUser.validationMessage) {
            let userExist = await User.findOne({ $or: [{ username: newUser.username }, { email: newUser.email }] })
            if (userExist) {
               Utils.retErr(req, res, 405, Msgs.msg(1, 'username / email'))
            } else {
               User.create(newUser, function(err, user) {
                  if (err) {
                     Utils.retErr(req, res, 405, Msgs.msg(2, 'inserir', OBJ, err.message))
                  } else {
                     Utils.retOk(req, res, 201, Utils.returnUser(user, false))
                  }
               })
            }
         } else Utils.retErr(req, res, 405, newUser.validationMessage)
      } catch (err) {
         Utils.retErr(req, res, 405, Msgs.msg(3, 'addUser', err.message))
      }
   },

   async updateUsuario(req, res) {
      try {
         let updtUser = await Utils.validateInput(req, OB, true)
         if (!updtUser.validationMessage) {
            let userExist = await User.findOne({
               $and: [{ $or: [{ username: updtUser.username }, { email: updtUser.email }] }, { idUser: { $ne: updtUser.id } }]
            })

            if (userExist) {
               Utils.retErr(req, res, 405, Msgs.msg(1, 'username / email'))
            } else {
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
                        Utils.retErr(req, res, 405, Msgs.msg(2, 'atualizar', OBJ, err.message))
                     } else if (doc.nModified === 0 && doc.n === 0) {
                        Utils.retErr(req, res, 404, Msgs.msg(5, OBJ, updtUser.idUser))
                     } else {
                        Utils.retOk(req, res, 200, Utils.returnUser(updtUser, true))
                     }
                  }
               )
            }
         } else Utils.retErr(req, res, 405, updtUser.validationMessage)
      } catch (err) {
         Utils.retErr(req, res, 405, Msgs.msg(3, 'updateUsuario', err.message))
      }
   },

   async getUserById(req, res) {
      try {
         const { userId } = req.params
         if (!userId) {
            Utils.retErr(req, res, 400, Msgs.msg(3, OBJ))
         } else {
            User.find({ idUser: userId }).exec((err, user) => {
               if (err) {
                  Utils.retErr(req, res, 404, Msgs.msg(2, 'consultar', OBJ, err.message))
               } else if (user.length === 0) {
                  Utils.retErr(req, res, 404, Msgs.msg(5, OBJ, userId))
               } else {
                  Utils.retOk(req, res, 200, Utils.returnUser(user[0], true))
               }
            })
         }
      } catch (err) {
         Utils.retErr(req, res, 405, Msgs.msg(3, 'getUserById', err.message))
      }
   },

   async deleteUser(req, res) {
      try {
         const { userId } = req.params
         if (!userId) {
            Utils.retErr(req, res, 400, Msgs.msg(3, OBJ))
         } else {
            User.deleteOne({ idUser: userId }, function(err, doc) {
               if (err) {
                  Utils.retErr(req, res, 404, Msgs.msg(2, 'remover', OBJ, err.message))
               } else if (doc.deletedCount === 0) {
                  Utils.retErr(req, res, 404, Msgs.msg(5, OBJ, userId))
               } else {
                  Utils.retOk(req, res, 200, { message: Msgs.msg(6, OBJ, userId) })
               }
            })
         }
      } catch (err) {
         Utils.retErr(req, res, 405, Msgs.msg(3, 'deleteUser', err.message))
      }
   },

   async loginUser(req, res) {
      try {
         let auth = await Utils.validateInput(req, 'Login', false)
         if (!auth.validationMessage) {
            User.findOne({
               $or: [{ username: auth.login }, { email: auth.login }]
            })
               .select('+password')
               .exec(function(err, user) {
                  if (err) {
                     Utils.retErr(req, res, 400, Msgs.msg(2, 'consultar', OBJ, err.message))
                  } else if (!user) {
                     Utils.retErr(req, res, 400, Msgs.msg(7, auth.login, OBJ))
                  } else {
                     if (!(auth.senha === user.password)) {
                        Utils.retErr(req, res, 400, `Senha incorreta`)
                     } else {
                        Utils.retOk(req, res, 200, {
                           description: 'Usuário logado com sucesso',
                           token: Token.generateToken({ idUser: user._id })
                        })
                     }
                  }
               })
         } else Utils.retErr(req, res, 400, auth.validationMessage)
      } catch (err) {
         Utils.retErr(req, res, 400, Msgs.msg(3, 'loginUser', err.message))
      }
   },

   async getUsers(req, res) {
      try {
         let page = req.query.page
         let limit = req.query.limit
         page = page > 0 ? page : 1
         limit = limit > 0 ? limit : 100
         let skip = limit * (page - 1)
         User.find({}, { _id: false })
            .skip(skip)
            .limit(limit)
            .exec((err, users) => {
               if (err) {
                  Utils.retErr(req, res, 400, 'Users searched failed!')
               } else if (users.length === 0) {
                  Utils.retErr(req, res, 400, `Page ${page} exceeded existing amount!`)
               } else {
                  users = Utils.replaceStr(users, ['idUser', 'T00:00:00.000Z'], ['id', ''])
                  Utils.retOk(req, res, 200, users)
               }
            })
      } catch (err) {
         Utils.retErr(req, res, 404, Msgs.msg(3, 'getUsers', err.message))
      }
   }
}
