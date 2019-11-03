const express = require('express')

//importaÃ§Ã£o dos Controllers
const UserController = require('./controllers/UserController')
const EventTypeController = require('./controllers/EventTypeController')
const EventController = require('./controllers/EventController')

const routes = express.Router()

const authMiddleware = require('./middlewares/Auth')

//rotas da API
routes.post('/user', UserController.addUser)
routes.put('/user', authMiddleware, UserController.updateUsuario)
routes.get('/user', authMiddleware, UserController.getUsers)
routes.get('/user/:userId', authMiddleware, UserController.getUserById)
routes.delete('/user/:userId', authMiddleware, UserController.deleteUser)
routes.post('/user/login', UserController.loginUser)

routes.post('/tipoEvento', authMiddleware, EventTypeController.addEventType)
routes.get('/tipoEvento', authMiddleware, EventTypeController.getTipoEvento)

routes.post('/event', authMiddleware, EventController.addEvent)

module.exports = routes
