const protocols = require('./response-protocols')
const inputs = require('./validators')
const isEmail = require('isemail')
const moment = require('moment')

module.exports = {
   formatDate(date) {
      var d = new Date(date),
         month = '' + (d.getMonth() + 1),
         day = '' + d.getDate(),
         year = d.getFullYear()
      if (month.length < 2) month = '0' + month
      if (day.length < 2) day = '0' + day
      return [year, month, day].join('-')
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
      let inputReq = {}
      let dateFormats = []
      let attributes = inputs.objects[`${objectName}`].bodyAttributes
      for (let i = 0; i < attributes.length; i++) {
         attribute = attributes[i].name
         type = attributes[i].type

         if (attribute === 'id' && idIsRequired) {
            isRequired = true
         } else {
            isRequired = attributes[i].required
         }

         if (attribute === 'id' && !idIsRequired) {
            inputReq[attribute] = undefined
         } else if (type === 'objectReference' && isRequired && req.body[attribute]['id'] === undefined) {
            return { validationMessage: `Parâmetro ${attribute}.id é obrigatório.` }
         }

         if (isRequired && req.body[attribute] === undefined) {
            return { validationMessage: `Parâmetro ${attribute} é obrigatório.` }
         } else if (!isRequired && req.body[attribute] === undefined) {
            inputReq[attribute] = null
         } else {
            if (type === 'objectReference') {
               inputReq[attribute] = req.body[attribute].id
            } else if (attribute === 'id' && idIsRequired) {
               inputReq[attribute + objectName] = req.body[attribute]
            } else {
               inputReq[attribute] = req.body[attribute]
            }
         }

         if (isRequired && type === 'date-time') {
            dateFormats = ['YYYY-MM-DDTHH:mm:ss.sss+HH:mm' /**moment.ISO_8601 */]
            if (!moment(inputReq[attribute], dateFormats, true).isValid())
               return {
                  validationMessage: `${attribute} = ${inputReq[attribute]} não está no formato YYYY-MM-DDTHH:mm:ss.sss+HH:mm.`
               }
         } else if (isRequired && type === 'date') {
            dateFormats = ['YYYY-MM-DD' /**moment.ISO_8601 */]
            if (!moment(inputReq[attribute], dateFormats, true).isValid())
               return { validationMessage: `${attribute} = ${inputReq[attribute]} não está no formato YYYY-MM-DD` }
         } else if (isRequired && type === 'email') {
            if (isEmail.validate(inputReq[attribute]))
               return { validationMessage: `${attribute} = ${inputReq[attribute]} não é um email válido.` }
         } else if (isRequired && type === 'string') {
            if (inputReq[attribute] === '') return { validationMessage: `O conteúdo do atributo ${attribute} está vazio ("").` }
         } else if (isRequired && type === 'int64') {
            if (Number.isInteger(inputReq[attribute]) && inputReq[attribute] > 0)
               return { validationMessage: `${attribute} = ${inputReq[attribute]} não é um número válido.` }
         } else if (type === 'objectReference') {
            if (isRequired && !Number.isInteger(inputReq[attribute]) && inputReq[attribute] > 0)
               return { validationMessage: `${attribute}.id = ${inputReq[attribute]} não é um número de id válido.` }
         }
      }
      return inputReq
   },

   relationIdMongo(req, res, statusCode, objName, err, obj, id) {
      if (err) {
         this.retErr(req, res, statusCode, { msg: `Banco de dados nao conseguiu consultar ${objName}: ${err.message}` })
      } else if (!obj) {
         this.retErr(req, res, statusCode, { msg: `Não foi encontrado nenhum ${objName} com o id = ${id}.` })
      } else {
         return obj._id
      }
   },

   returnEvent(event, eventType, user) {
      let eventRet = {
         id: event.idEvent,
         title: event.title,
         startDate: event.startDate,
         endDate: event.endDate,
         city: event.city,
         street: event.street,
         neighborhood: event.neighborhood,
         referencePoint: event.referencePoint ? event.referencePoint : undefined,
         description: event.description ? event.description : undefined,
         status: event.status ? event.status : undefined,
         eventType: {
            id: eventType.idEventType,
            name: eventType.name
         },
         user: user
            ? {
                 id: user.idUser,
                 username: user.username,
                 email: user.email,
                 //password: null,
                 birthdate: user.birthdate ? this.formatDate(user.birthdate) : undefined,
                 sex: user.sex ? user.sex : undefined
              }
            : undefined
      }
      return eventRet
   },

   returnUser(user, showPassword) {
      let userRet = {
         id: user.idUser,
         username: user.username,
         email: user.email,
         password: showPassword ? user.password : undefined,
         birthdate: user.birthdate ? this.formatDate(user.birthdate) : undefined,
         sex: user.sex ? user.sex : undefined
      }
      return userRet
   },

   retErr(req, res, statusCode, msg) {
      let path = req.route.path
      let method = req.method.toLowerCase()
      let desc = protocols.paths[`${path}`].methods[`${method}`].responses[`${statusCode}`].description
      console.log(desc)
      console.log(msg)
      return res.status(statusCode).json({ description: desc, message: msg })
   },

   retOk(req, res, statusCode, obj) {
      let path = req.route.path
      let method = req.method
      let nomeObj = null
      let acao = null
      let final = 'o'
      let msg = ''

      switch (path) {
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
         case '/user':
            nomeObj = 'Usuário'
            break
         case '/user/:userId':
            nomeObj = 'Usuário'
            break
         case '/user/login':
            nomeObj = 'Usuário'
            acao = 'autenticad'
            break
         case '/mensagem':
            nomeObj = 'Mensagem'
            final = 'a'
            break
         default:
            break
      }

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

      if (nomeObj && acao) msg = statusCode + ' - ' + nomeObj + ' foi ' + acao + final + ' com sucesso!'

      console.log(msg)

      if (path === '/user' && method === 'POST' && statusCode === 201) {
         obj.password = 'Sua senha está segura em nossa base de dados! :D'
         obj.sex = obj.sex ? obj.sex : undefined
      }

      return res.status(statusCode).json(obj)
   }
}
