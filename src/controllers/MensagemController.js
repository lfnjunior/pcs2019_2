const Message = require('../models/Message')
const Utils = require('../utils/utils')
const Msgs = require('../utils/messages')
const OB = 'Message'
const OBJ = 'Mensagem'

module.exports = {
   async addMensagem(req, res) {
      try {
         let newMessage = await Utils.validateInput(req, OB, false)
         if (!newMessage.validationMessage) {
            Message.create(newMessage, function(err, message) {
               if (err) {
                  Utils.retErr(res, Msgs.msg(2, 'inserir', OBJ, err.message))
               } else {
                  Utils.retOk(req, res, { message: 'Mensagem inserida com sucesso' })
               }
            })
         } else Utils.retErr(res, newMessage.validationMessage)
      } catch (err) {
         Utils.retErr(res, Msgs.msg(3, 'addMessage', err.message))
      }
   },

   async updateMessage(req, res) {
      try {
         let updtMessage = await Utils.validateInput(req, OB, true)
         if (!updtMessage.validationMessage) {
            Message.updateOne(
               { idMessage: updtMessage.idMessage },
               {
                  messageDate: !updtMessage.messageDate ? null : updtMessage.messageDate,
                  message: !updtMessage.message ? null : updtMessage.message,
                  password: !updtMessage.participantId ? null : updtMessage.participantId
               },
               {
                  upsert: false
               },
               function(err, doc) {
                  if (err) {
                     Utils.retErr(res, Msgs.msg(2, 'atualizar', OBJ, err.message))
                  } else if (doc.nModified === 0 && doc.n === 0) {
                     Utils.retErr(res, Msgs.msg(5, OBJ, updtMessage.idMessage))
                  } else {
                     Utils.retOk(req, res, Utils.returnMessage(updtMessage, true))
                  }
               }
            )
         } else Utils.retErr(res, updtMessage.validationMessage)
      } catch (err) {
         Utils.retErr(res, Msgs.msg(3, 'updateUsuario', err.message))
      }
   },

   async getMensagemById(req, res) {
      try {
         const { participantId } = req.params
         if (participantId) {
            Message.find({ participantId: participantId }).exec((err, messages) => {
               if (err) {
                  Utils.retErr(res, Msgs.msg(2, 'consultar', OBJ, err.message))
               } else if (messages.length !== 0) {
                  Utils.retOk(req, res, Utils.returnMessages(messages))
               } else Utils.retErr(res, Msgs.msg(5, OBJ, participantId))
            })
         } else Utils.retErr(res, Msgs.msg(3, OBJ))
      } catch (err) {
         Utils.retErr(res, Msgs.msg(3, 'getMessageById', err.message))
      }
   },

   async deleteMensagem(req, res) {
      try {
         const { msgId } = req.params
         if (msgId) {
            Message.deleteOne({ idMessage: msgId }, function(err, doc) {
               if (err) {
                  Utils.retErr(res, Msgs.msg(2, 'remover', OBJ, err.message))
               } else if (doc.deletedCount === 0) {
                  Utils.retErr(res, Msgs.msg(5, OBJ, msgId))
               } else {
                  Utils.retOk(req, res, { message: Msgs.msg(6, OBJ, msgId) })
               }
            })
         } else Utils.retErr(res, Msgs.msg(3, OBJ))
      } catch (err) {
         Utils.retErr(res, Msgs.msg(3, 'deleteMessage', err.message))
      }
   }
}
