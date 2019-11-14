const Utils = require('../utils/utils')
const User = require('../models/User')
const Event = require('../models/Event')
const Message = require('../models/Message')
const Participant = require('../models/Participant')
const Msgs = require('../utils/messages')
const OB = 'Participant'
const OBJ = 'participante'

module.exports = {
   async addParticipant(req, res) {
      try {
         //valida entradas
         let newParticipant = await Utils.validateInput(req, OB, false)
         if (newParticipant.validationMessage) {
            return Utils.retErr(res, newParticipant.validationMessage)
         }

         //consulta id do Event
         let event = await Event.findOne({ idEvent: newParticipant.eventoId })
         if (!event) {
            return Utils.retErr(res, Msgs.msg(5, 'Event', newParticipant.eventoId))
         }

         //consulta id do User
         let user = await User.findOne({ idUser: newParticipant.userId }, '_id username')
         if (!user) {
            return Utils.retErr(res, Msgs.msg(5, 'User', newParticipant.userId))
         }

         //consulta id do User
         let participantExists = await Participant.findOne({ $and: [{ userId: user._id }, { eventoId: event._id }] })
         if (participantExists) {
            return Utils.retErr(res, Msgs.msg(13, newParticipant.userId, newParticipant.eventoId))
         }

         //prepara o objeto para o banco
         newParticipant.eventoId = event._id
         newParticipant.userId = user._id
         newParticipant.registrationDate = new Date()

         let participant = await Participant.create(newParticipant)
         if (!participant) {
            return Utils.retErr(res, Msgs.msg(2, 'inserir', OBJ, ' :/'))
         }

         event.participant.push({
            id: participant.idParticipant,
            username: user.username,
            registrationDate: participant.registrationDate
         })

         await event.save(event)

         return Utils.retOk(req, res, { message: `O ${OBJ} foi inserido com sucesso` })
      } catch (err) {
         return Utils.retErr(res, Msgs.msg(3, 'addParticipant', err.message))
      }
   },

   async getParticipantById(req, res) {
      try {
         const { participantId } = req.params
         if (!participantId) {
            return Utils.retErr(res, 400, Msgs.msg(3, OBJ))
         }

         let participant = await Participant.findOne({ idEvent: participantId })
            .populate('userId')
            .populate('eventoId')

         if (!participant) {
            return Utils.retErr(res, Msgs.msg(5, OBJ, participantId))
         }

         let retPart = {
            id: participant.IdParticipant,
            userId: participant.userId.idUser,
            eventoId: participant.eventoId.idEvent,
            registrationDate: participant.registrationDate
         }

         return Utils.retOk(req, res, retPart)
      } catch (err) {
         return Utils.retErr(res, Msgs.msg(3, 'getParticipantById', err.message))
      }
   },

   async deleteParticipant(req, res) {
      try {
         //valida entrada
         const { participantId } = req.params
         if (!participantId) {
            return Utils.retErr(res, Msgs.msg(3, OBJ))
         }

         //procura participant
         let participant = await Participant.findOne({ idParticipant: participantId })
         if (!participant) {
            return Utils.retErr(res, Msgs.msg(5, OBJ, participantId))
         }

         //procura event
         let event = await Event.findOne({ idEvent: participant.eventoId })
         if (event) {
            event.participant.pull({ id: participantId })
            await event.save(event)
         }

         //verifica em messages se já existe algum participant Vinculado
         //Caso exista bloqueia a exclusão
         let messages = await Message.find({ participantId: participantId })
         if (messages) {
            return Utils.retErr(res, Msgs.msg(11, OBJ, participantId, 'Message'))
         }

         //deleta participante
         Participant.deleteOne({ IdParticipant: participantId }, function(err, doc) {
            if (err) {
               return Utils.retErr(res, Msgs.msg(2, 'remover', OBJ, err.message))
            } else if (doc.deletedCount === 0) {
               return Utils.retErr(res, Msgs.msg(5, OBJ, participantId))
            } else {
               return Utils.retOk(req, res, { message: Msgs.msg(6, OBJ, participantId) })
            }
         })
      } catch (err) {
         return Utils.retErr(res, Msgs.msg(3, 'deleteParticipant', err.message))
      }
   }
}
