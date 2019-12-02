const inputs = require('./validators')
const moment = require('moment')
const Participant = require('../models/Participant')

module.exports = {
   formatDateTime(date) {
      return moment(date).format('YYYY-MM-DDTHH:mm:ss.sssZ')
   },

   replaceStr(json, oldStr, newStr) {
      let str = JSON.stringify(json)
      for (let i = 0; i < oldStr.length; i++) {
         str = str.replace(new RegExp(oldStr[i], 'g'), newStr[i])
      }
      return JSON.parse(str)
   },

   async validateInput(req, objectName, idIsRequired) {
      let attribute = null
      let isRequired = null
      let type = null
      let buildObj = {}
      let dateFormats = []
      let attributes = inputs.objects[`${objectName}`].bodyAttributes
      for (let i = 0; i < attributes.length; i++) {
         attribute = attributes[i].name

         type = attributes[i].type

         if (attribute === 'participantId' && idIsRequired) {
            isRequired = false
         } else if (attribute === 'id' && idIsRequired) {
            isRequired = true
         } else {
            isRequired = attributes[i].required
         }

         if (isRequired && req.body[attribute] === undefined) {
            return { validationMessage: `Parâmetro ${attribute} é obrigatório.` }
         } else if (!isRequired && req.body[attribute] === undefined) {
            buildObj[attribute] = null
         } else {
            if (attribute === 'id' && idIsRequired) {
               buildObj[attribute + objectName] = req.body[attribute]
            } else {
               buildObj[attribute] = req.body[attribute]
            }
         }

         if (isRequired) {
            if (type === 'string') {
               if (buildObj[attribute] === '') {
                  return { validationMessage: `O conteúdo do atributo ${attribute} está vazio ("").` }
               }
            }
            if (type === 'int64') {
               if (Number.isInteger(buildObj[attribute]) && buildObj[attribute] <= 0) {
                  return { validationMessage: `${attribute} = ${buildObj[attribute]} não é um número válido.` }
               }
            }
         }

         if (buildObj[attribute]) {
            //validação de date_time
            if (type === 'date-time') {
               dateFormats = ['YYYY-MM-DDTHH:mm:ss.sssZ'] /**moment.ISO_8601 */
               if (!moment(buildObj[attribute], dateFormats, true).isValid()) {
                  return { validationMessage: `${attribute} = ${buildObj[attribute]} não está no formato YYYY-MM-DDTHH:mm:ss.sssZ.` }
               }
            }
            //validação de sex
            if (attribute === 'sex') {
               if (!(buildObj[attribute] === 'M' || buildObj[attribute] === 'F')) {
                  return { validationMessage: `Sexo = ${buildObj[attribute]} inválido. deve ser M ou F.` }
               }
            }
         }
      }
      return buildObj
   },

   relationIdMongo(res, objName, err, obj, id) {
      if (err) {
         this.retErr(res`Banco de dados nao conseguiu consultar ${objName}: ${err.message}`)
      } else if (!obj) {
         this.retErr(res, `Não foi encontrado nenhum ${objName} com o id = ${id}.`)
      } else {
         return obj._id
      }
   },

   returnEventTypes(eventTypes) {
      let eventTypesRet = []
      if (eventTypes.length > 0) {
         for (let i = 0; i < eventTypes.length; i++) {
            eventTypesRet[i] = this.returnEventType(eventTypes[i])
         }
      } else {
         eventTypesRet = eventTypes
      }
      return eventTypesRet
   },

   returnEvents(events) {
      let eventsRet = []
      if (events.length > 0) {
         for (let i = 0; i < events.length; i++) {
            eventsRet[i] = this.returnEvent(events[i], events[i].eventTypeId, events[i].ownerId)
         }
      } else {
         eventsRet = events
      }
      return eventsRet
   },

   returnEvent(event, eventType, user) {
      let eventRet = {
         id: event.idEvent,
         title: event.title,
         startDate: this.formatDateTime(event.startDate),
         endDate: this.formatDateTime(event.endDate),
         city: event.city,
         street: event.street,
         neighborhood: event.neighborhood,
         referencePoint: event.referencePoint ? event.referencePoint : undefined,
         description: event.description ? event.description : undefined,
         status: event.status,
         eventType: this.returnEventType(eventType),
         user: this.returnUser(user, false),
         participant: this.participantsInEvent(event.participant)
      }
      return eventRet
   },

   returnEventType(eventType) {
      let eventTypeRet = {
         id: eventType.idEventType,
         name: eventType.name
      }
      return eventTypeRet
   },

   returnUser(user, showPassword) {
      let userRet = {
         id: user.idUser,
         username: user.username,
         email: user.email,
         //password: showPassword ? user.password : undefined,
         birthdate: user.birthdate ? this.formatDateTime(user.birthdate) : undefined,
         sex: user.sex ? user.sex : undefined
      }
      return userRet
   },

   participantsInEvent(participant) {
      let ret = []
      if (participant.length > 0) {
         for (let i = 0; i < participant.length; i++) {
            ret[i] = {
               id: participant[i].id,
               username: participant[i].username,
               registrationDate: participant[i].registrationDate
            }
         }
      }
      return ret
   },

   returnParticipants(participants) {
      let participantsRet = []
      if (participants.length > 0) {
         for (let i = 0; i < participants.length; i++) {
            participantsRet[i].id = participants.ownerId.idUser
            participantsRet[i].username = participants.ownerId.username
            participantsRet[i].subscriptionDate = participants.subscriptionDate
         }
      } else {
         participantsRet = participants
      }
      return participantsRet
   },

   returnMessages(messages) {
      let messagesRet = []
      if (messages.length > 0) {
         for (let i = 0; i < messages.length; i++) {
            messagesRet[i] = this.returnMessage(messages[i])
         }
      } else {
         messagesRet = messages
      }
      return messagesRet
   },

   returnMessage(message) {
      let messageRet = {
         id: message.idMessage,
         messageDate: message.messageDate,
         message: message.message,
         participantId: message.participantId.idParticipant
      }
      return messageRet
   },

   retErr(res, msg) {
      console.log(msg)
      return res.status(400).json({ message: msg })
   },

   retOk(req, res, obj) {
      let path = req.route.path
      let method = req.method
      let nomeObj = null
      let acao = null
      let final = 'o'
      let msg = ''

      switch (path) {
         case '/event/:eventId':
            nomeObj = 'Evento'
            break
         case '/event':
            nomeObj = 'Evento'
            break
         case '/tipoEvento':
            nomeObj = 'Tipo de Evento'
            acao = 'consultad'
            break
         case '/event/search':
            nomeObj = 'Evento'
            break
         case '/user/:userId':
            nomeObj = 'Usuário'
            break
         case '/user/login':
            nomeObj = 'Usuário'
            acao = 'autenticad'
            break
         case '/user':
            nomeObj = 'Usuário'
            break
         case '/mensagem':
            nomeObj = 'Mensagem'
            final = 'a'
            break
         default:
            break
      }

      if (!acao) {
         switch (method) {
            case 'POST':
               acao = 'gravad'
               break
            case 'PUT':
               acao = 'atualizad'
               break
            case 'DELETE':
               acao = 'deletad'
               break
            case 'GET':
               acao = 'consultad'
               break
            default:
               break
         }
      }

      if (path === '/me') msg = 'Usuário autenticado com sucesso'

      if (nomeObj && acao) msg = nomeObj + ' foi ' + acao + final + ' com sucesso!'

      console.log(msg)

      return res.status(200).json(obj)
   }
}
