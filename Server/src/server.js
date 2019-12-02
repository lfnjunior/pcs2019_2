const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const routes = require("./routes");

const PORT_LISTENING = 3000;
const DB_HOST = "api.lfnjunior.tk";
const DB_NAME = "pcs2019_2";

const app = express();
//app.use(allowCors)

const server = require("http").Server(app);

mongoose.connect(`mongodb://${DB_HOST}/${DB_NAME}`, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

//x-powered-by desabilitado, para que do lado cliente
//não seja express medida de segurança
app.disable("x-powered-by");

app.use(cors()); //Configuração para mermissão de origens de requisição
app.use(express.json()); //Definito formato Json para troca de mensagens da API

app.use(routes);

server.listen(PORT_LISTENING);
