const EventType = require("../models/EventType");
const Utils = require("../utils/utils");

module.exports = {
  async addEventType(req, res) {
    try {
      const { name } = req.body;
      console.log("Metodo invocado: addEventType");
      if (!name) {
        console.log("Parametro name obrigatorio esta faltando :");
        console.log(name);
        return res.status(405).json({
          description: "Entrada Invalida",
          message:
            "Algum parametro obrigatorio esta faltando, de acordo com a estrutura do Objeto EventType, os campos (name) são obrigatórios"
        });
      } else if (await EventType.findOne({ name })) {
        console.log("name ja esta cadastrado");
        return res.status(405).json({
          description: "Entrada Invalida",
          message: "Name não está disponível"
        });
      } else {
        const newEventType = {};
        newEventType.name = name;
        EventType.create(newEventType, function(err, eventType) {
          if (err) {
            console.log("O Tipo de Evento nao foi inserido no banco");
            return res.status(405).json({ description: "Entrada Invalida" });
          } else {
            console.log(
              `Usuario ${eventType.name} foi gravado no banco de dados.`
            );
            return res.status(201).json({
              description: "Tipo de Evento criado",
              id: eventType.idEventType,
              name: eventType.name
            });
          }
        });
      }
    } catch (err) {
      console.log("Erro funcao addEventType:");
      console.log(err);
      return res.status(405).json({ description: "Entrada Invalida" });
    }
  },

  async getTipoEvento(req, res) {
    try {
      console.log("Metodo invocado: getTipoEvento");
      var eventTypeProjection = {
        _id: false
      };
      EventType.find({}, eventTypeProjection).exec((err, eventTypes) => {
        if (err) {
          console.log("Erro ao realizar consulta no banco de dados");
          console.log(err);
          return res.status(405).json({ description: "Validation exception" });
        } else if (eventTypes.length === 0) {
          console.log(
            "Não foi encontrado nenhum tipo de evento cadastrado na base de daados"
          );
          return res.status(404).json({
            description: "Tipo de evento não encontrado!"
          });
        } else {
          console.log(
            `A consulta vai retornar ${eventTypes.length} tipos de eventos`
          );
          return res
            .status(200)
            .json(Utils.replaceStr(eventTypes, ["idEventType"], ["id"]));
        }
      });
    } catch (err) {
      console.log("Erro funcao getTipoEvento:");
      console.log(err);
      return res.status(405).json({ description: "Validation exception" });
    }
  }
};
