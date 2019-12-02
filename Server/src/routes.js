const express = require('express')

//importaÃ§Ã£o dos Controllers
const UserController = require('./controllers/UserController')
const EventTypeController = require('./controllers/EventTypeController')
const EventController = require('./controllers/EventController')
const ParticipantController = require('./controllers/ParticipantController')
const MensagemController = require('./controllers/MensagemController')
const AuthController = require('./controllers/AuthController')

const routes = express.Router()

const auth = require('./midllewares/Auth')

//rotas da API
routes.post('/user', UserController.addUser)
routes.put('/user', auth, UserController.updateUsuario)
routes.get('/user', auth, UserController.getUsers)
routes.get('/user/:userId', auth, UserController.getUserById)
routes.delete('/user/:userId', auth, UserController.deleteUser)
routes.post('/user/login', AuthController.loginUser)

routes.post('/tipoEvento', EventTypeController.addEventType)
routes.get('/tipoEvento', auth, EventTypeController.getTipoEvento)

routes.get('/event', auth, EventController.getEvent)
routes.post('/event', auth, EventController.addEvent)
routes.put('/event', auth, EventController.updateEvent)
routes.get('/event/search', auth, EventController.eventSearch)
routes.get('/event/:eventId', auth, EventController.getEventById)
routes.delete('/event/:eventId', auth, EventController.deleteEvent)

routes.post('/participant', auth, ParticipantController.addParticipant)
routes.get('/participant/:participantId', auth, ParticipantController.getParticipantById)
routes.delete('/participant/:participantId', auth, ParticipantController.deleteParticipant)

routes.post('/mensagem', auth, MensagemController.addMensagem)
routes.put('/mensagem', auth,  MensagemController.updateMessage)
routes.get('/mensagem/evento/:eventId', auth,  MensagemController.getMensagemById)
routes.delete('/mensagem/:msgId', auth,  MensagemController.deleteMensagem)


module.exports = routes
