const Message = require('../models/Message')
const Participant = require('../models/Participant')
const Event = require('../models/Event')
const Utils = require('../utils/utils')
const Msgs = require('../utils/messages')

const moment = require('moment')
const OB = 'Message'
const OBJ = 'Mensagem'

module.exports = {
   async addMensagem(req, res) {
      try {
         let newMessage = await Utils.validateInput(req, OB, false)
         if (newMessage.validationMessage) {
            return Utils.retErr(res, newMessage.validationMessage)
         }

         //consulta id do Participant
         let participant = await Participant.findOne({ idParticipant: newMessage.participantId }, '_id')
         .populate('eventoId')
         .populate('userId')

         if (!participant) {
            return Utils.retErr(res, Msgs.msg(5, 'Participant', newMessage.participantId))
         }
      
         if (participant.eventoId.status == false) {
            return Utils.retErr(res, `O ${OB} = ${participant.eventoId.idEvent} está cancelado!`)
         }

         if (participant.userId.idUser !== req.body.idUser) {
            return Utils.retErr(res, `O usuário ${req.body.idUser} não é está participando do evento e não pode enviar mensagens.`)
         }

         newMessage.participantId = participant._id
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

         //consulta id do Message
         let message = await Message.findOne({ idMessage: updtMessage.idMessage }).populate('participantId')
         if (!message) {
            return Utils.retErr(res, Msgs.msg(5, 'Message', updtMessage.idMessage))
         }

         let ret = {
            id: message.idMessage,
            message: updtMessage.message,
            participantId: message.participantId.idParticipant,
            messageDate: new Date()
         }

         updtMessage.messageDate = ret.messageDate
         updtMessage.participantId = message.participantId._id

         Message.updateOne({ idMessage: updtMessage.idMessage }, updtMessage, { upsert: false }, function(err, doc) {
            if (err) {
               return Utils.retErr(res, Msgs.msg(2, 'atualizar', OBJ, err.message))
            }

            if (doc.nModified === 0 && doc.n === 0) {
               return Utils.retErr(res, Msgs.msg(5, OBJ, updtMessage.idMessage))
            }
            ret.messageDate = moment(ret.messageDate).format('YYYY-MM-DDTHH:mm:ss.sssZ')
            return Utils.retOk(req, res, ret)
         })
      } catch (err) {
         return Utils.retErr(res, Msgs.msg(3, 'updateUsuario', err.message))
      }
   },

   async getMensagemById(req, res) {
      try {
         const { eventId } = req.params
         if (!eventId) {
            return Utils.retErr(res, Msgs.msg(3, OBJ))
         }

         //consulta id do Event
         let event = await Event.findOne({ idEvent: eventId })
         if (!event) {
            return Utils.retErr(res, Msgs.msg(5, 'Event', eventId))
         }

         //consulta participantes
         let participants = [] 
         participants = await Participant.find({ eventoId: event._id })
         if (participants.length <= 0) {
            return Utils.retErr(res, 'Este evento não possui nenhum participante, portanto não tem nenhuma mensagem.')
         }

         let allIdsParticipants = []
         for (let i = 0; i < participants.length; i++) {
            allIdsParticipants.push(participants[i]._id)
         }

         //consulta mensagens dos participantes no evento
         let mensagens = []
         mensagens = await Message.find({ participantId: { $in: allIdsParticipants } }).populate({
            path: 'participantId',
            populate: {
               path: 'userId',
               model: 'User'
            }
         })

         if (mensagens.length <= 0) {
            return Utils.retOk(req, res, [])
         }

         let ret = []

         for (let i = 0; i < mensagens.length; i++) {
            let r = {}
            r.id = mensagens[i].idMessage
            r.userId = mensagens[i].participantId.userId.idUser
            r.username = mensagens[i].participantId.userId.username
            r.messageDate = mensagens[i].messageDate
            r.message = mensagens[i].message
            ret[i] = r
         }

         return Utils.retOk(req, res, ret)
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
