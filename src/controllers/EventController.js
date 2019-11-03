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
         let newEvent = await Utils.validateInput(req, OB, false)

         if (!newEvent.validationMessage) {
            EventType.findOne({ idEventType: newEvent.eventType }).exec(function(err, eventType) {
               newEvent.eventType = Utils.relationIdMongo(req, res, 405, 'EventType', err, eventType, newEvent.eventType)

               if (!newEvent.user) {
                  Event.create(newEvent, function(err, event) {
                     if (err) Utils.retErr(req, res, 405, Msgs.msg(2, 'adicionar', OBJ, err.message))

                     Utils.retOk(req, res, 201, Utils.returnEvent(event, eventType, null))
                  })
               } else {
                  User.findOne({ idUser: newEvent.user }).exec(function(err, user) {
                     newEvent.user = Utils.relationIdMongo(req, res, 405, 'User', err, user, newEvent.user)

                     Event.create(newEvent, function(err, event) {
                        if (err) Utils.retErr(req, res, 405, Msgs.msg(2, 'adicionar', OBJ, err.message))

                        Utils.retOk(req, res, 201, Utils.returnEvent(event, eventType, user))
                     })
                  })
               }
            })
         } else Utils.retErr(req, res, 405, newEvent.validationMessage)
      } catch (err) {
         Utils.retErr(req, res, 405, Msgs.msg(3, 'addEvent', err.message))
      }
   },

   async updateEvent(req, res) {
      try {
         let updtEvent = await Utils.validateInput(req, OB, true)

         if (!updtEvent.validationMessage) {
            EventType.findOne({ idEventType: updtEvent.eventType }).exec(function(err, eventType) {
               updtEvent.eventType = Utils.relationIdMongo(req, res, 405, 'EventType', err, eventType, updtEvent.eventType)

               if (!updtEvent.user) {
                  Event.updateOne({ idEvent: updtEvent.idEvent }, updtEvent, { upsert: false }, function(err, doc) {
                     if (err) {
                        Utils.retErr(req, res, 405, Msgs.msg(2, 'atualizar', OBJ, err.message))
                     } else if (doc.nModified === 0 && doc.n === 0) {
                        Utils.retErr(req, res, 404, Msgs.msg(5, OBJ, updtEvent.idEvent))
                     } else {
                        Utils.retOk(req, res, 200, Utils.returnEvent(updtEvent, eventType, null))
                     }
                  })
               } else {
                  User.findOne({ idUser: updtEvent.user }).exec(function(err, user) {
                     updtEvent.user = Utils.relationIdMongo(req, res, 405, 'User', err, user, updtEvent.user)
                     Event.updateOne({ idEvent: updtEvent.idEvent }, updtEvent, { upsert: false }, function(err, doc) {
                        if (err) {
                           Utils.retErr(req, res, 405, Msgs.msg(2, 'atualizar', OBJ, err.message))
                        } else if (doc.nModified === 0 && doc.n === 0) {
                           Utils.retErr(req, res, 404, Msgs.msg(5, OBJ, updtEvent.idEvent))
                        } else {
                           Utils.retOk(req, res, 200, Utils.returnEvent(updtEvent, eventType, user))
                        }
                     })
                  })
               }
            })
         } else Utils.retErr(req, res, 405, updtEvent.validationMessage)
      } catch (err) {
         Utils.retErr(req, res, 405, Msgs.msg(3, 'updateEvent', err.message))
      }
   },

   async deleteEvent(req, res) {
      try {
         const { eventId } = req.params
         console.log('Metodo invocado: deleteEvent')
         if (eventId) {
            Event.deleteOne({ idEvent: eventId }, function(err, doc) {
               if (err) {
                  Utils.retErr(req, res, 404, Msgs.msg(2, 'deletar', OBJ, err.message))
               } else if (doc.deletedCount === 0) {
                  Utils.retErr(req, res, 404, Msgs.msg(5, OBJ, eventId))
               } else {
                  Utils.retOk(req, res, 200, { message: Msgs.msg(6, OBJ, eventId) })
               }
            })
         } else Utils.retErr(req, res, 405, Msgs.msg(4, OBJ))
      } catch (err) {
         Utils.retErr(req, res, 404, Msgs.msg(3, 'deleteEvent', err.message))
      }
   },

   async getEventById(req, res) {
      try {
         const { eventId } = req.params
         if (eventId) {
            Event.findOne({ idEvent: eventId })
               .populate('user')
               .populate('eventType')
               .exec((err, event) => {
                  if (err) {
                     Utils.retErr(req, res, 404, Msgs.msg(2, 'consultar', OBJ, err.message))
                  } else {
                     if (err) Utils.retErr(req, res, 404, Msgs.msg(2, 'consultar', OBJ, err.message))
                     Utils.retOk(req, res, 200, Utils.returnEvent(event, event.eventType, event.user))
                  }
               })
         } else Utils.retErr(req, res, 400, Msgs.msg(3, OBJ))
      } catch (err) {
         Utils.retErr(req, res, 404, Msgs.msg(3, 'getEventById', err.message))
      }
   },

   async getEvent(req, res) {
      try {
         Event.find({}, { _id: false })
            .populate('user')
            .populate('eventType')
            .exec((err, events) => {
               if (err) {
                  Utils.retErr(req, res, 405, Msgs.msg(8, 'consultar', OBJ, err.message))
               } else if (events.length === 0) {
                  Utils.retErr(req, res, 404, Msgs.msg(9, OBJ, err.message))
               } else {
                  Utils.retOk(req, res, 200, Utils.returnEvents(events))
               }
            })
      } catch (err) {
         Utils.retErr(req, res, 405, Msgs.msg(3, 'getEvent', err.message))
      }
   },

   async eventSearch(req, res) {
      try {
         const { rdate, start_date, end_date, event_type, title } = req.query
         let conditions = null
         if (rdate) {
            conditions = {}
         } else if (start_date && end_date) {
            let dateFormats = ['YYYY-MM-DD']
            if (!moment(start_date, dateFormats, true).isValid())
               Utils.retErr(req, res, 405, `start_date = ${start_date} não está no formato YYYY-MM-DD`)
            if (!moment(end_date, dateFormats, true).isValid())
               Utils.retErr(req, res, 405, `end_date = ${end_date} não está no formato YYYY-MM-DD`)
            let start = moment(start_date).format('YYYY-MM-DDTHH:mm:ss.SSSZ')
            let end = moment(end_date).format('YYYY-MM-DDTHH:mm:ss.SSSZ')
            conditions = {
               startDate: { $gte: start, $lte: end }
            }
         } else if (title) {
            conditions = { title: { $regex: '.*' + title + '.*', $options: 'i' } }
         }
         console.log(conditions)
         if (!conditions) {
            if (event_type) {
               EventType.findOne({ idEventType: event_type }, '_id').exec(function(err, evtTp) {
                  if (err) Utils.retErr(req, res, 405, Msgs.msg(2, 'consultar', 'eventType', err.message))
                  conditions = { eventType: evtTp._id }
                  Event.find(conditions, { _id: false })
                     .populate('user')
                     .populate('eventType')
                     .exec((err, events) => {
                        if (err) {
                           Utils.retErr(req, res, 405, Msgs.msg(8, 'consultar', OBJ, err.message))
                        } else if (events.length === 0) {
                           Utils.retErr(req, res, 404, Msgs.msg(9, 'evento', err.message))
                        } else {
                           Utils.retOk(req, res, 200, Utils.returnEvents(events))
                        }
                     })
               })
            } else Utils.retErr(req, res, 405, `Não foi fornecido nenhum filtro válido`)
         } else {
            Event.find(conditions, { _id: false })
               .populate('user')
               .populate('eventType')
               .exec((err, events) => {
                  if (err) {
                     Utils.retErr(req, res, 405, Msgs.msg(8, 'consultar', OBJ, err.message))
                  } else if (events.length === 0) {
                     Utils.retErr(req, res, 404, Msgs.msg(9, 'evento', err.message))
                  } else {
                     Utils.retOk(req, res, 200, Utils.returnEvents(events))
                  }
               })
         }
      } catch (err) {
         Utils.retErr(req, res, 405, Msgs.msg(3, 'eventSearchGET', err.message))
      }
   }
}
