const express = require("express");
const rateLimit = require("express-rate-limit");

//importaÃ§Ã£o dos Controllers
const UserController = require("./controllers/UserController");

const EventTypeController = require("./controllers/EventTypeController");

const routes = express.Router();

const loginAccountLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 3 // 3 requests
});

//const authMiddleware = require("./middlewares/Auth");

//rotas da API
routes.post("/user", UserController.addUser);
routes.put("/user", UserController.updateUsuario);
routes.get("/user", UserController.getUsers);
routes.get("/user/:userId", UserController.getUserById);
routes.delete("/user/:userId", UserController.deleteUser);
routes.post("/user/login", loginAccountLimiter, UserController.loginUser);

routes.post("/tipoEvento", EventTypeController.addEventType);
routes.get("/tipoEvento", EventTypeController.getTipoEvento);

module.exports = routes;
