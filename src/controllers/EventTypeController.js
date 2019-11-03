const EventType = require('../models/EventType')
const Utils = require('../utils/utils')
const Msgs = require('../utils/messages')
const OB = 'EventType'
const OBJ = 'tipo de evento'

module.exports = {
   async addEventType(req, res) {
      try {
         const { name } = req.body

         if (name) {
            let eventTypeExist = await EventType.findOne({ name })
            if (!eventTypeExist) {
               EventType.create({ name: name }, function(err, eventType) {
                  if (err) {
                     Utils.retErr(req, res, 405, Msgs.msg(2, 'inserir', OBJ, err.message))
                  } else {
                     Utils.retOk(req, res, 201, Utils.returnEventType(eventType))
                  }
               })
            } else Utils.retErr(req, res, 405, Msgs.msg(1, 'name'))
         } else Utils.retErr(req, res, 405, 'Atributo name não foi informado')
      } catch (err) {
         Utils.retErr(req, res, 405, Msgs.msg(3, 'addEventType', err.message))
      }
   },

   async getTipoEvento(req, res) {
      try {
         EventType.find({}, { _id: false }).exec((err, eventTypes) => {
            if (err) {
               Utils.retErr(req, res, 405, Msgs.msg(8, 'consultar', OBJ, err.message))
            } else if (eventTypes.length === 0) {
               Utils.retErr(req, res, 404, Msgs.msg(9, OBJ, err.message))
            } else {
               Utils.retOk(req, res, 200, Utils.returnEventTypes(eventTypes))
            }
         })
      } catch (err) {
         Utils.retErr(req, res, 404, Msgs.msg(3, 'getTipoEvento', err.message))
      }
   }
}
