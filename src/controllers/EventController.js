const Utils = require('../utils/utils')
const User = require('../models/User')
const EventType = require('../models/EventType')
const Event = require('../models/Event')
const Msgs = require('../utils/messages')
const moment = require('moment')
const OB = 'Event'
const OBJ = 'evento'

module.exports = {
   async addEvent(req, res) {
      try {
         //validação da entrada
         let newEvent = await Utils.validateInput(req, OB, false)
         if (newEvent.validationMessage) {
            return Utils.retErr(res, newEvent.validationMessage)
         }

         //consulta id do EventType
         let eventType = await EventType.findOne({ idEventType: newEvent.eventTypeId })
         if (!eventType) {
            return Utils.retErr(res, Msgs.msg(5, 'EventType', newEvent.eventTypeId))
         }
         newEvent.eventTypeId = eventType._id

         //consulta id do User
         let user = await User.findOne({ idUser: newEvent.ownerId })
         if (!user) {
            return Utils.retErr(res, Msgs.msg(5, 'User', newEvent.eventTypeId))
         }
         newEvent.ownerId = user._id

         //Grava Event
         Event.create(newEvent, function(err, event) {
            if (err) {
               return Utils.retErr(res, Msgs.msg(2, 'adicionar', OBJ, err.message))
            }
            return Utils.retOk(req, res, { message: 'Evento criado com sucesso' })
         })
      } catch (err) {
         return Utils.retErr(res, Msgs.msg(3, 'addEvent', err.message))
      }
   },

   async updateEvent(req, res) {
      try {
         //validação da entrada
         let updtEvent = await Utils.validateInput(req, OB, true)
         if (updtEvent.validationMessage) {
            return Utils.retErr(res, updtEvent.validationMessage)
         }

         //consulta id do EventType
         let eventType = await EventType.findOne({ idEventType: updtEvent.eventTypeId })
         if (!eventType) {
            return Utils.retErr(res, Msgs.msg(5, 'EventType', updtEvent.eventTypeId))
         }
         updtEvent.eventTypeId = eventType._id

         //consulta id do User
         let user = await User.findOne({ idUser: updtEvent.ownerId })
         if (!user) {
            return Utils.retErr(res, Msgs.msg(5, 'User', updtEvent.eventTypeId))
         }
         updtEvent.ownerId = user._id

         //consulta id do Event
         let event = await Event.findOne({ idEvent: updtEvent.id }, '_id')
         if (!event) {
            return Utils.retErr(res, Msgs.msg(5, 'Event', updtEvent.eventTypeId))
         }
         updtEvent.participant = event.participant

         //atualiza Event
         Event.updateOne({ idEvent: updtEvent.idEvent }, updtEvent, { upsert: false }, function(err, doc) {
            if (err) {
               return Utils.retErr(res, Msgs.msg(2, 'atualizar', OBJ, err.message))
            } else if (doc.nModified === 0 && doc.n === 0) {
               return Utils.retErr(res, Msgs.msg(5, OBJ, updtEvent.idEvent))
            } else {
               return Utils.retOk(req, res, Utils.returnEvent(updtEvent, eventType, user))
            }
         })
      } catch (err) {
         return Utils.retErr(res, Msgs.msg(3, 'updateEvent', err.message))
      }
   },

   async deleteEvent(req, res) {
      try {
         const { eventId } = req.params
         if (!eventId) {
            return Utils.retErr(res, Msgs.msg(4, OBJ))
         }
         Event.deleteOne({ idEvent: eventId }, function(err, doc) {
            if (err) {
               return Utils.retErr(res, Msgs.msg(2, 'deletar', OBJ, err.message))
            } else if (doc.deletedCount === 0) {
               return Utils.retErr(res, Msgs.msg(5, OBJ, eventId))
            } else {
               return Utils.retOk(req, res, { message: Msgs.msg(6, OBJ, eventId) })
            }
         })
      } catch (err) {
         return Utils.retErr(res, Msgs.msg(3, 'deleteEvent', err.message))
      }
   },

   async getEventById(req, res) {
      try {
         const { eventId } = req.params
         if (!eventId) {
            return Utils.retErr(res, 400, Msgs.msg(3, OBJ))
         }
         let event = await Event.findOne({ idEvent: eventId })
            .populate('ownerId')
            .populate('eventTypeId')

         if (!event) {
            return Utils.retErr(res, Msgs.msg(5, OBJ, eventId))
         }

         return Utils.retOk(req, res, Utils.returnEvent(event, event.eventTypeId, event.ownerId))
      } catch (err) {
         return Utils.retErr(res, Msgs.msg(3, 'getEventById', err.message))
      }
   },

   async getEvent(req, res) {
      try {
         Event.find({}, { _id: false })
            .populate('ownerId')
            .populate('eventTypeId')
            .exec((err, events) => {
               if (err) {
                  return Utils.retErr(res, Msgs.msg(8, 'consultar', OBJ, err.message))
               } else if (events.length === 0) {
                  return Utils.retErr(res, Msgs.msg(9, OBJ, err.message))
               } else {
                  return Utils.retOk(req, res, Utils.returnEvents(events))
               }
            })
      } catch (err) {
         return Utils.retErr(res, Msgs.msg(3, 'getEvent', err.message))
      }
   },

   async eventSearch(req, res) {
      try {
         const { start_date, end_date, event_type } = req.query
         let conditions = null
         let start = null
         let end = null

         if (start_date && end_date) {
            let dateFormat = ['YYYY-MM-DDTHH:mm:ss.SSSZ']
            if (!moment(start_date, dateFormat, true).isValid())
               return Utils.retErr(res, `start_date = ${start_date} não está no formato YYYY-MM-DD`)
            if (!moment(end_date, dateFormat, true).isValid())
               return Utils.retErr(res, `end_date = ${end_date} não está no formato YYYY-MM-DD`)
            start = moment(start_date).format('YYYY-MM-DDTHH:mm:ss.SSSZ')
            end = moment(end_date).format('YYYY-MM-DDTHH:mm:ss.SSSZ')
         }

         if (start_date && end_date && event_type) {
            conditions = {
               $and: [
                  {
                     startDate: { $gte: start, $lte: end }
                  },
                  {
                     idEventType: event_type
                  }
               ]
            }
         } else if (start_date && end_date) {
            conditions = { startDate: { $gte: start, $lte: end } }
         } else if (event_type) {
            conditions = { idEventType: event_type }
         }

         if (!conditions) {
            return Utils.retErr(res, `Não foi fornecido nenhum filtro válido`)
         }

         Event.find(conditions, { _id: false })
            .populate('user')
            .populate('eventType')
            .exec((err, events) => {
               if (err) {
                  return Utils.retErr(res, Msgs.msg(8, 'consultar', OBJ, err.message))
               } else if (events.length === 0) {
                  return Utils.retErr(res, Msgs.msg(10, 'evento'))
               } else {
                  return Utils.retOk(req, res, Utils.returnEvents(events))
               }
            })
      } catch (err) {
         return Utils.retErr(res, Msgs.msg(3, 'eventSearchGET', err.message))
      }
   }
}
