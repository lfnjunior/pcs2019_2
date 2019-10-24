const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const routes = require("./routes");

const PORT_LISTENING = 8080;
const DB_HOST = "35.247.198.63";
const DB_NAME = "pcs2019_2";

const app = express();

const server = require("http").Server(app);

mongoose.connect(`mongodb://${DB_HOST}/${DB_NAME}`, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

//x-powered-by desabilitado, para que do lado cliente
//nÃ£o seja express medida de seguranÃ§a
app.disable("x-powered-by");

app.use(cors()); //ConfiguraÃ§Ã£o para mermissÃ£o de origens de requisiÃ§Ã£o
app.use(express.json()); //Definito formato Json para troca de mensagens da API

app.use(routes);

server.listen(PORT_LISTENING);
