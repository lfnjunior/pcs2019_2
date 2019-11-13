const Utils = require('../utils/utils')
const User = require('../models/User')
const Event = require('../models/Event')
const Participant = require('../models/Participant')
const Msgs = require('../utils/messages')
const OB = 'Participant'
const OBJ = 'participante'

module.exports = {
   async addParticipant(req, res) {
      try {
         let newParticipant = await Utils.validateInput(req, OB, false)

         if (newParticipant.validationMessage) {
            return Utils.retErr(res, newParticipant.validationMessage)
         }

         //consulta id do Event
         let event = await Event.findOne({ idEvent: newParticipant.eventoId })
         if (!event) {
            return Utils.retErr(res, Msgs.msg(5, 'Event', newParticipant.eventoId))
         }
         newParticipant.eventoId = event._id

         //consulta id do Event
         let user = await User.findOne({ idUser: newParticipant.userId })
         if (!user) {
            return Utils.retErr(res, Msgs.msg(5, 'User', newParticipant.userId))
         }
         newParticipant.eventoId = event._id

         newParticipant.registrationDate = new Date()

         let participant = await Participant.create(newParticipant)
         if (!participant) {
            return Utils.retErr(res, Msgs.msg(2, 'inserir', OBJ, 'Verifique os dados'))
         }

         event.friends.push({
            id: participant.IdParticipant,
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
            return Utils.retErr(res, Msgs.msg(5, OBJ, participant))
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
         const { participantId } = req.params
         if (!participantId) {
            return Utils.retErr(res, Msgs.msg(3, OBJ))
         }
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
