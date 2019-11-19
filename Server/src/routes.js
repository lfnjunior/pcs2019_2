const express = require('express')

//importaÃ§Ã£o dos Controllers
const UserController = require('./controllers/UserController')
const EventTypeController = require('./controllers/EventTypeController')
const EventController = require('./controllers/EventController')
const ParticipantController = require('./controllers/ParticipantController')
const MensagemController = require('./controllers/MensagemController')
const AuthController = require('./controllers/AuthController')

const routes = express.Router()

//const auth = require('./midllewares/Auth')

//rotas da API
// routes.post('/user', UserController.addUser)
// routes.put('/user', auth, UserController.updateUsuario)
// routes.get('/user', auth, UserController.getUsers)
// routes.get('/user/:userId', auth, UserController.getUserById)
// routes.delete('/user/:userId', auth, UserController.deleteUser)
// routes.post('/user/login', UserController.loginUser)

// routes.post('/tipoEvento', auth, EventTypeController.addEventType)
// routes.get('/tipoEvento', auth, EventTypeController.getTipoEvento)

// routes.get('/event', auth, EventController.getEvent)
// routes.post('/event', auth, EventController.addEvent)
// routes.put('/event', auth, EventController.updateEvent)
// routes.get('/event/search', auth, EventController.eventSearch)
// routes.get('/event/:eventId', auth, EventController.getEventById)
// routes.delete('/event/:eventId', auth, EventController.deleteEvent)

routes.post('/user', UserController.addUser)
routes.put('/user', UserController.updateUsuario)
routes.get('/user', UserController.getUsers)
routes.get('/user/:userId', UserController.getUserById)
routes.delete('/user/:userId', UserController.deleteUser)
routes.post('/user/login', AuthController.loginUser)

routes.post('/tipoEvento', EventTypeController.addEventType)
routes.get('/tipoEvento', EventTypeController.getTipoEvento)

routes.get('/event', EventController.getEvent)
routes.post('/event', EventController.addEvent)
routes.put('/event', EventController.updateEvent)
routes.get('/event/search', EventController.eventSearch)
routes.get('/event/:eventId', EventController.getEventById)
routes.delete('/event/:eventId', EventController.deleteEvent)

routes.post('/participant', ParticipantController.addParticipant)
routes.get('/participant/:participantId', ParticipantController.getParticipantById)
routes.delete('/participant/:participantId', ParticipantController.deleteParticipant)

routes.post('/mensagem', MensagemController.addMensagem)
routes.put('/mensagem', MensagemController.updateMessage)
routes.get('/mensagem/evento/:eventId', MensagemController.getMensagemById)
routes.delete('/mensagem/:msgId', MensagemController.deleteMensagem)

routes.post('/me', AuthController.auth)

module.exports = routes
