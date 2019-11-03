const Utils = require('../utils/utils')
const User = require('../models/User')
const EventType = require('../models/EventType')
const Event = require('../models/Event')

module.exports = {
   async addEvent(req, res) {
      try {
         let newEvent = await Utils.validateInput(req, 'Event', false)

         if (!newEvent.validationMessage) {
            EventType.findOne({ idEventType: newEvent.eventType }).exec(function(err, eventType) {
               newEvent.eventType = Utils.relationIdMongo(req, res, 405, 'EventType', err, eventType, newEvent.eventType)

               if (!newEvent.user) {
                  Event.create(newEvent, function(err, event) {
                     if (err) Utils.retErr(req, res, 405, { msg: `O Evento não foi gravado ${err.message}` })

                     Utils.retOk(req, res, 201, Utils.returnEvent(event, eventType, null))
                  })
               } else {
                  User.findOne({ idUser: newEvent.user }).exec(function(err, user) {
                     newEvent.user = Utils.relationIdMongo(req, res, 405, 'User', err, user, newEvent.user)

                     Event.create(newEvent, function(err, event) {
                        if (err) Utils.retErr(req, res, 405, { msg: `O Evento não foi gravado ${err.message}` })

                        Utils.retOk(req, res, 201, Utils.returnEvent(event, eventType, user))
                     })
                  })
               }
            })
         } else Utils.retErr(req, res, 405, { msg: newEvent.validationMessage })
      } catch (err) {
         Utils.retErr(req, res, 405, { msg: `Erro funcao addEvent : ${err.message}` })
      }
   },

   async updateEvent(req, res) {
      let msg = ''
      try {
         const {
            endDate,
            city,
            street,
            description,
            id,
            neighborhood,
            eventType,
            title,
            user,
            startDate,
            referencePoint,
            status
         } = req.body
         console.log('Metodo invocado: updateEvent')
         if (!id) {
            msg = `Código identificador do Evento não foi fornecido`
            Utils.retErr(req, res, 400, msg)
         } else if (!title || !startDate || !endDate || !street || !neighborhood || !city || !eventType.id) {
            msg =
               `Algum parâmetro obrigatório está faltando, ` +
               `de acordo com a estrutura do Objeto Event, campos obrigatórios: \n` +
               `title: ${title}\n ` +
               `startDate: ${endDate}\n ` +
               `street: ${street}\n` +
               `neighborhood: ${neighborhood}\n ` +
               `city: ${city}\n ` +
               `eventType: ${eventType.id}`
            Utils.retErr(req, res, 405, msg)
         } else {
            Event.updateOne(
               { idEvent: id },
               {
                  endDate: endDate,
                  city: city,
                  street: street,
                  description: description ? description : null,
                  neighborhood: neighborhood,
                  //eventType: eventType,
                  title: title,
                  //user: user,
                  startDate: startDate,
                  referencePoint: referencePoint ? referencePoint : null
                  //status: status ? status : false
               },
               {
                  upsert: false
               },
               function(err, doc) {
                  if (err) {
                     msg = `Banco de dados nao conseguiu executar a operacao: `
                     Utils.retErr(req, res, 405, msg + err.message)
                  } else if (doc.nModified === 0) {
                     msg = `Evento com id (${id}) não existe no banco de dados.`
                     Utils.retErr(req, res, 404, msg)
                  } else {
                     Utils.retOk(req, res, 200, {
                        endDate: endDate,
                        city: city,
                        street: street,
                        description: description ? description : undefined,
                        neighborhood: neighborhood,
                        //eventType: eventType,
                        title: title,
                        //user: user,
                        startDate: startDate,
                        referencePoint: referencePoint ? referencePoint : undefined,
                        status: status
                     })
                  }
               }
            )
         }
      } catch (err) {
         msg = 'Função updateEvent:\n' + JSON.stringify(err)
         Utils.retErr(req, res, 405, msg)
      }
   },

   async deleteEvent(req, res) {
      let msg = ''
      try {
         //const { api_key } = req.headers;
         const { eventId } = req.params
         console.log('Metodo invocado: deleteEvent')
         if (!eventId) {
            msg = `Código identificador do Evento não foi fornecido`
            Utils.retErr(req, res, 400, msg)
         } else {
            Event.deleteOne({ idEvent: eventId }, function(err, doc) {
               if (err) {
                  msg = 'Banco de dados nao conseguiu realizar a exclusão:'
                  Utils.retErr(req, res, 404, msg + err.message)
               } else if (doc.deletedCount === 0) {
                  msg = `Nenhum evento foi encontrado no banco de dados com a id ${eventId}.`
                  Utils.retErr(req, res, 404, msg)
               } else {
                  msg = `Evento com ID ${eventId} foi removido do banco de dados.`
                  Utils.retOk(req, res, 200, { message: msg })
               }
            })
         }
      } catch (err) {
         msg = 'Função deleteEvent:\n' + JSON.stringify(err)
         Utils.retErr(req, res, 404, msg)
      }
   },

   async getEventById(req, res) {
      let msg = ''
      try {
         const { eventId } = req.params
         console.log('Metodo invocado: getEventById')
         if (!eventId) {
            msg = `Código identificador do Evento não foi fornecido`
            Utils.retErr(req, res, 400, msg)
         } else {
            Event.find({ idEvent: eventId }).exec((err, evento) => {
               if (err) {
                  msg = 'Banco de dados nao conseguiu retornar a consulta:'
                  Utils.retErr(req, res, 404, msg + err.message)
               } else if (evento.length === 0) {
                  msg = `Nenhum evento foi encontrado no banco de dados com a id ${eventId}.`
                  Utils.retErr(req, res, 404, msg)
               } else {
                  Utils.retOk(req, res, 404, {
                     id: eventId,
                     endDate: evento.endDate,
                     city: evento.city,
                     street: evento.street,
                     description: evento.description ? evento.description : undefined,
                     neighborhood: evento.neighborhood,
                     eventType: evento.eventType, //JOIN
                     title: evento.title,
                     user: evento.user, //JOIN
                     startDate: evento.startDate,
                     referencePoint: evento.referencePoint ? evento.referencePoint : undefined,
                     status: evento.status
                  })
               }
            })
         }
      } catch (err) {
         msg = 'Função getEventById:\n' + JSON.stringify(err)
         Utils.retErr(req, res, 404, msg)
      }
   },

   async getEvent(req, res) {
      let msg = ''
      try {
         Event.find().exec((err, events) => {
            if (err) {
               msg = 'Events searched failed!'
               Utils.retErr(req, res, 405, msg)
            } else if (events.length === 0) {
               msg = `Nenhum evento foi encontrado!`
               Utils.retErr(req, res, 404, msg)
            } else {
               events = Utils.replaceStr(events, ['idEvent'], ['id'])
               Utils.retOk(req, res, 200, events)
            }
         })
      } catch (err) {
         msg = 'Função getEvent:\n' + JSON.stringify(err)
         Utils.retErr(req, res, 405, msg)
      }
   },

   async eventSearchGET(req, res) {
      const rdate = req.swagger.params['rdate'].value
      const start_date = req.swagger.params['start_date'].value
      const end_date = req.swagger.params['end_date'].value
      const event_type = req.swagger.params['event_type'].value
   }
}
