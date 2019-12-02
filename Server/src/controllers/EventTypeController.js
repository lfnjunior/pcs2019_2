const EventType = require('../models/EventType')
const Utils = require('../utils/utils')
const Msgs = require('../utils/messages')
const OB = 'EventType'
const OBJ = 'tipo de evento'

module.exports = {
   async addEventType(req, res) {
      try {
         const { name } = req.body
         if (!name) {
            return Utils.retErr(res,  'Atributo name não foi informado')
         }

         let eventTypeExist = await EventType.findOne({ name })
         if (eventTypeExist) {
            return Utils.retErr(res,  Msgs.msg(1, 'name'))
         }

         EventType.create({ name: name }, function(err, eventType) {
            if (err) {
               return Utils.retErr(res,  Msgs.msg(2, 'inserir', OBJ, err.message))
            } else {
               return Utils.retOk(req, res, Utils.returnEventType(eventType))
            }
         })
      } catch (err) {
         return Utils.retErr(res,  Msgs.msg(3, 'addEventType', err.message))
      }
   },

   async getTipoEvento(req, res) {
      try {
         EventType.find({}, { _id: false }).exec((err, eventTypes) => {
            if (err) {
               return Utils.retErr(res, Msgs.msg(8, 'consultar', OBJ, err.message))
            } else if (eventTypes.length === 0) {
               return Utils.retOk(req, res, [])
            } else {
               return Utils.retOk(req, res, Utils.returnEventTypes(eventTypes))
            }
         })
      } catch (err) {
         return Utils.retErr(res, Msgs.msg(3, 'getTipoEvento', err.message))
      }
   }
}
