const Message = require('../models/Message')
const Utils = require('../utils/utils')
const Msgs = require('../utils/messages')
const OB = 'Message'
const OBJ = 'Mensagem'

module.exports = {
   async addMensagem(req, res) {
      try {
         let newMessage = await Utils.validateInput(req, OB, false)
         if (newMessage.validationMessage) {
            return Utils.retErr(res, newMessage.validationMessage)
         }
         newMessage.messageDate = new Date()
         Message.create(newMessage, function(err, m) {
            if (err) {
               return Utils.retErr(res, Msgs.msg(2, 'inserir', OBJ, err.message))
            } else {
               return Utils.retOk(req, res, { message: 'Mensagem inserida com sucesso' })
            }
         })
      } catch (err) {
         return Utils.retErr(res, Msgs.msg(3, 'addMessage', err.message))
      }
   },

   async updateMessage(req, res) {
      try {
         let updtMessage = await Utils.validateInput(req, OB, true)
         if (updtMessage.validationMessage) {
            return Utils.retErr(res, updtMessage.validationMessage)
         }

         updtMessage.messageDate = new Date()
         Message.updateOne(
            { idMessage: updtMessage.idMessage },
            {
               messageDate: updtMessage.messageDate,
               message: updtMessage.message,
               password: updtMessage.participantId
            },
            {
               upsert: false
            },
            function(err, doc) {
               if (err) {
                  return Utils.retErr(res, Msgs.msg(2, 'atualizar', OBJ, err.message))
               }

               if (doc.nModified === 0 && doc.n === 0) {
                  return Utils.retErr(res, Msgs.msg(5, OBJ, updtMessage.idMessage))
               }

               return Utils.retOk(req, res, Utils.returnMessage(updtMessage, true))
            }
         )
      } catch (err) {
         return Utils.retErr(res, Msgs.msg(3, 'updateUsuario', err.message))
      }
   },

   async getMensagemById(req, res) {
      try {
         const { participantId } = req.params
         if (!participantId) {
            return Utils.retErr(res, Msgs.msg(3, OBJ))
         }

         Message.find({ participantId: participantId }).exec((err, messages) => {
            if (err) {
               return Utils.retErr(res, Msgs.msg(2, 'consultar', OBJ, err.message))
            }
            if (messages.length !== 0) {
               return Utils.retOk(req, res, Utils.returnMessages(messages))
            }
            return Utils.retErr(res, Msgs.msg(5, OBJ, participantId))
         })
      } catch (err) {
         return Utils.retErr(res, Msgs.msg(3, 'getMessageById', err.message))
      }
   },

   async deleteMensagem(req, res) {
      try {
         const { msgId } = req.params
         if (!msgId) {
            return Utils.retErr(res, Msgs.msg(3, OBJ))
         }

         Message.deleteOne({ idMessage: msgId }, function(err, doc) {
            if (err) {
               return Utils.retErr(res, Msgs.msg(2, 'remover', OBJ, err.message))
            }

            if (doc.deletedCount === 0) {
               return Utils.retErr(res, Msgs.msg(5, OBJ, msgId))
            }

            return Utils.retOk(req, res, { message: Msgs.msg(6, OBJ, msgId) })
         })
      } catch (err) {
         return Utils.retErr(res, Msgs.msg(3, 'deleteMessage', err.message))
      }
   }
}
