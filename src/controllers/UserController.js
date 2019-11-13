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
            let userExist = await User.findOne({
               email: newUser.email
               //$or: [{ username: newUser.username }, { email: newUser.email }]
            })
            if (!userExist) {
               User.create(newUser, function(err, user) {
                  if (err) {
                     Utils.retErr(res, Msgs.msg(2, 'inserir', OBJ, err.message))
                  } else {
                     Utils.retOk(req, res, Utils.returnUser(user, false))
                  }
               })
               // } else Utils.retErr(res, Msgs.msg(1, 'username / email'))
            } else Utils.retErr(res, Msgs.msg(1, 'email'))
         } else Utils.retErr(res, newUser.validationMessage)
      } catch (err) {
         Utils.retErr(res, Msgs.msg(3, 'addUser', err.message))
      }
   },

   async updateUsuario(req, res) {
      try {
         let updtUser = await Utils.validateInput(req, OB, true)
         if (!updtUser.validationMessage) {
            let userExist = await User.findOne({
               $and: [{ $or: [{ username: updtUser.username }, { email: updtUser.email }] }, { idUser: { $ne: updtUser.id } }]
            })

            if (!userExist) {
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
                        Utils.retErr(res, Msgs.msg(2, 'atualizar', OBJ, err.message))
                     } else if (doc.nModified === 0 && doc.n === 0) {
                        Utils.retErr(res, Msgs.msg(5, OBJ, updtUser.idUser))
                     } else {
                        Utils.retOk(req, res, Utils.returnUser(updtUser, true))
                     }
                  }
               )
            } else Utils.retErr(res, Msgs.msg(1, 'username / email'))
         } else Utils.retErr(res, updtUser.validationMessage)
      } catch (err) {
         Utils.retErr(res, Msgs.msg(3, 'updateUsuario', err.message))
      }
   },

   async getUserById(req, res) {
      try {
         const { userId } = req.params
         if (userId) {
            User.find({ idUser: userId }).exec((err, user) => {
               if (err) {
                  Utils.retErr(res, Msgs.msg(2, 'consultar', OBJ, err.message))
               } else if (user.length !== 0) {
                  Utils.retOk(req, res, Utils.returnUser(user[0], false))
               } else Utils.retErr(res, Msgs.msg(5, OBJ, userId))
            })
         } else Utils.retErr(res, Msgs.msg(3, OBJ))
      } catch (err) {
         Utils.retErr(res, Msgs.msg(3, 'getUserById', err.message))
      }
   },

   async deleteUser(req, res) {
      try {
         const { userId } = req.params
         if (userId) {
            User.deleteOne({ idUser: userId }, function(err, doc) {
               if (err) {
                  Utils.retErr(res, Msgs.msg(2, 'remover', OBJ, err.message))
               } else if (doc.deletedCount === 0) {
                  Utils.retErr(res, Msgs.msg(5, OBJ, userId))
               } else {
                  Utils.retOk(req, res, { message: Msgs.msg(6, OBJ, userId) })
               }
            })
         } else Utils.retErr(res, Msgs.msg(3, OBJ))
      } catch (err) {
         Utils.retErr(res, Msgs.msg(3, 'deleteUser', err.message))
      }
   },

   async loginUser(req, res) {
      try {
         let auth = await Utils.validateInput(req, 'Login', false)
         if (!auth.validationMessage) {
            User.findOne({ $or: [{ username: auth.email }, { email: auth.email }] }).exec(function(err, user) {
               if (err) {
                  Utils.retErr(res, Msgs.msg(2, 'consultar', OBJ, err.message))
               } else if (user) {
                  if (!(auth.password === user.password)) {
                     Utils.retErr(res, `Senha incorreta`)
                  } else {
                     Utils.retOk(req, res, { token: Token.generateToken({ idUser: user._id }) })
                  }
               } else Utils.retErr(res, Msgs.msg(7, OBJ, auth.email))
            })
         } else Utils.retErr(res, auth.validationMessage)
      } catch (err) {
         Utils.retErr(res, Msgs.msg(3, 'loginUser', err.message))
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
                  Utils.retErr(res, 'Users searched failed!')
               } else if (users.length !== 0) {
                  users = Utils.replaceStr(users, ['idUser', 'T00:00:00.000Z'], ['id', ''])
                  Utils.retOk(req, res, users)
               } else Utils.retErr(res, `Page ${page} exceeded existing amount!`)
            })
      } catch (err) {
         Utils.retErr(res, Msgs.msg(3, 'getUsers', err.message))
      }
   }
}
