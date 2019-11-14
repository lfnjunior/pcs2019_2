const Utils = require('../utils/utils')
const User = require('../models/User')
const EventType = require('../models/EventType')
const Event = require('../models/Event')
const Participant = require('../models/Participant')
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
        return Utils.retErr(res, Msgs.msg(5, 'User', newEvent.ownerId))
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
        return Utils.retErr(res, Msgs.msg(5, 'User', updtEvent.ownerId))
      }
      updtEvent.ownerId = user._id

      //consulta id do Event
      let event = await Event.findOne({ idEvent: updtEvent.idEvent }, '_id')
      if (!event) {
        return Utils.retErr(res, Msgs.msg(5, 'Event', updtEvent.idEvent))
      }

      //consulta os participantes no evento
      let participants = await Participant.find({ eventoId: event._id }).populate('userId')

      let retParticipants = []

      if (!(participants.length === 0)) {
        for (let i = 0; i < participants.length; i++) {
          let p = {}
          p.id = participants[i].idParticipant
          p.username = participants[i].userId.username
          p.registrationDate = participants[i].registrationDate
          retParticipants[i] = p
        }
      }

      //atualiza Event
      Event.updateOne({ idEvent: updtEvent.idEvent }, updtEvent, { upsert: false }, function(err, doc) {
        if (err) {
          return Utils.retErr(res, Msgs.msg(2, 'atualizar', OBJ, err.message))
        } else if (doc.nModified === 0 && doc.n === 0) {
          return Utils.retErr(res, Msgs.msg(5, OBJ, updtEvent.idEvent))
        } else {
          updtEvent.participant = retParticipants
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

      //consulta id do Event
      let event = await Event.findOne({ idEvent: eventId }, '_id')
      if (!event) {
        return Utils.retErr(res, Msgs.msg(5, OBJ, eventId))
      }

      //verifica em participant se já existe algum user Vinculado
      //Caso exista bloqueia a exclusão
      let participants = await Participant.find({ eventoId: event._id }, '_id')
      if (participants.length > 0) {
        return Utils.retErr(res, Msgs.msg(11, OBJ, eventId, 'Participant'))
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

      //consulta os participantes no evento
      let participants = await Participant.find({ eventoId: event._id }).populate('userId')

      let retParticipants = []

      if (!(participants.length === 0)) {
        for (let i = 0; i < participants.length; i++) {
          let p = {}
          p.id = participants[i].idParticipant
          p.username = participants[i].userId.username
          p.registrationDate = participants[i].registrationDate
          retParticipants[i] = p
        }
      }

      event.participant = retParticipants

      return Utils.retOk(req, res, Utils.returnEvent(event, event.eventTypeId, event.ownerId))
    } catch (err) {
      return Utils.retErr(res, Msgs.msg(3, 'getEventById', err.message))
    }
  },

  async getEvent(req, res) {
    try {
      let events = await Event.find()
        .populate('ownerId')
        .populate('eventTypeId')
      for (let j = 0; j < events.length; j++) {
        //consulta os participantes no evento
        let participants = await Participant.find({ eventoId: events[j]._id }).populate('userId')

        let retParticipants = []

        if (!(participants.length === 0)) {
          for (let i = 0; i < participants.length; i++) {
            let p = {}
            p.id = participants[i].idParticipant
            p.username = participants[i].userId.username
            p.registrationDate = participants[i].registrationDate
            retParticipants[i] = p
          }
        }

        events[j].participant = retParticipants
      }
      return Utils.retOk(req, res, Utils.returnEvents(events))
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
        //verifica se já existe um user com o email
        let eventType = await EventType.findOne({ idEventType: event_type }, '_id')
        if (!eventType) {
          return Utils.retErr(res, Msgs.msg(5, 'EventType', event_type))
        }
        conditions = { eventTypeId: eventType._id }
      }

      if (!conditions) {
        return Utils.retErr(res, `Não foi fornecido nenhum filtro válido`)
      }

      let events = await Event.find(conditions)
        .populate('ownerId')
        .populate('eventTypeId')
      if (events.length === 0) {
        return Utils.retErr(res, Msgs.msg(10, 'evento'))
      }

      for (let j = 0; j < events.length; j++) {
        //consulta os participantes no evento
        let participants = await Participant.find({ eventoId: events[j]._id }).populate('userId')

        let retParticipants = []

        if (!(participants.length === 0)) {
          for (let i = 0; i < participants.length; i++) {
            let p = {}
            p.id = participants[i].idParticipant
            p.username = participants[i].userId.username
            p.registrationDate = participants[i].registrationDate
            retParticipants[i] = p
          }
        }

        events[j].participant = retParticipants
      }
      return Utils.retOk(req, res, Utils.returnEvents(events))
    } catch (err) {
      return Utils.retErr(res, Msgs.msg(3, 'eventSearchGET', err.message))
    }
  }
}
