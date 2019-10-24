const express = require('express')
const rateLimit = require("express-rate-limit")

//importaÃ§Ã£o dos Controllers
const UserController = require('./controllers/UserController')

const routes = express.Router()

const createAccountLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5, // 5 requests
    message: "Limite de requiziÃ§Ãµes foi atingido, tente novamente mais tarde"
});

const loginAccountLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 3, // 3 requests
});

const userRequestsLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 200, // 200 requests
    message: "Limite de requiziÃ§Ãµes foi atingido, tente novamente mais tarde"
});

//const authMiddleware = require("./middlewares/Auth");

//rotas da API
routes.post('/user', createAccountLimiter, /*authMiddleware,*/  UserController.addUser)
routes.put('/user', userRequestsLimiter, /*authMiddleware,*/  UserController.updateUsuario)
routes.get('/user/:userId', userRequestsLimiter,/*authMiddleware,*/ UserController.getUserById)
routes.delete('/user/:userId', userRequestsLimiter,/*authMiddleware,*/ UserController.deleteUser)
routes.post('/user/login', loginAccountLimiter, UserController.loginUser)

module.exports = routes