const Utils = require("../utils/utils");
const User = require("../models/User");
const EventType = require("../models/EventType");
const Event = require("../models/Event");

module.exports = {
  async addEvent(req, res) {
    let msg = "";
    try {
      const newEvent = {
        endDate: req.body.endDate,
        city: req.body.city,
        street: req.body.street,
        description: req.body.description ? req.body.description : null,
        id: req.body.id,
        neighborhood: req.body.neighborhood,
        eventType: req.body.eventType,
        title: req.body.title,
        user: req.body.user,
        startDate: req.body.startDate,
        referencePoint: req.body.referencePoint
          ? req.body.referencePoint
          : null,
        status: req.body.status ? req.body.status : false
      };
      console.log("Metodo invocado: addEvent");
      if (
        !newEvent.title ||
        !newEvent.startDate ||
        !newEvent.endDate ||
        !newEvent.street ||
        !newEvent.neighborhood ||
        !newEvent.city ||
        !newEvent.eventType.id
      ) {
        msg =
          `Algum parâmetro obrigatório está faltando, ` +
          `de acordo com a estrutura do Objeto Event, campos obrigatórios: \n` +
          `title: ${newEvent.title}\n ` +
          `startDate: ${newEvent.endDate}\n ` +
          `street: ${newEvent.street}\n` +
          `neighborhood: ${newEvent.neighborhood}\n ` +
          `city: ${newEvent.city}\n ` +
          `eventType: ${newEvent.eventType.id}`;
        Utils.retErr(res, req, 405, msg);
      } else {
        EventType.findOne({ idEventType: newEvent.eventType.id }, "_id").exec(
          function(err, eventType) {
            if (err) {
              msg = `Banco de dados nao conseguiu consultar: ${err.message}`;
              Utils.retErr(res, req, 405, msg);
            } else if (!eventType) {
              msg =
                `não foi encontrado nenhum Tipo de Evento com o` +
                `parametro (id) = ${newEvent.eventType.id}.`;
              Utils.retErr(res, req, 405, msg);
            } else {
              newEvent.eventType = eventType._id;
              User.findOne({ idUser: newEvent.user.id }, "_id").exec(function(
                err,
                user
              ) {
                if (err) {
                  msg = `Banco de dados nao conseguiu consultar: ${
                    err.message
                  }`;
                  Utils.retErr(res, req, 405, msg);
                } else if (!user) {
                  msg =
                    `não foi encontrado nenhum Usuário com o` +
                    `parametro (id) = ${newEvent.user.id}.`;
                  Utils.retErr(res, req, 405, msg);
                } else {
                  newEvent.user = user._id;
                  Event.create(newEvent, function(err, user) {
                    if (err) {
                      msg =
                        "description: Entrada Invalida - O Usuario nao foi inserido no banco";
                      console.log(err.message);
                      Utils.retErr(res, req, 405, msg);
                    } else {
                      //Utils.retOk(res, req, 201, newEvent);
                      msg = "Evento Criado";
                      Utils.retOk(res, req, 201, { message: msg });
                    }
                  });
                }
              });
            }
          }
        );
      }
    } catch (err) {
      msg = "Erro funcao addUser:\n" + JSON.stringify(err);
      Utils.ret(res, req, 405, msg, req);
    }
  },

  async updateEvent(req, res) {
    let msg = "";
    try {
      const {
        endDate,
        city,
        street,
        description,
        id,
        neighborhood,
        eventType,
        title,
        user,
        startDate,
        referencePoint,
        status
      } = req.body;
      console.log("Metodo invocado: updateEvent");
      if (!id) {
        msg = `Código identificador do Evento não foi fornecido`;
        Utils.retErr(res, req, 400, msg);
      } else if (
        !title ||
        !startDate ||
        !endDate ||
        !street ||
        !neighborhood ||
        !city ||
        !eventType.id
      ) {
        msg =
          `Algum parâmetro obrigatório está faltando, ` +
          `de acordo com a estrutura do Objeto Event, campos obrigatórios: \n` +
          `title: ${title}\n ` +
          `startDate: ${endDate}\n ` +
          `street: ${street}\n` +
          `neighborhood: ${neighborhood}\n ` +
          `city: ${city}\n ` +
          `eventType: ${eventType.id}`;
        Utils.retErr(res, req, 405, msg);
      } else {
        Event.updateOne(
          { idEvent: id },
          {
            endDate: endDate,
            city: city,
            street: street,
            description: description ? description : null,
            neighborhood: neighborhood,
            //eventType: eventType,
            title: title,
            //user: user,
            startDate: startDate,
            referencePoint: referencePoint ? referencePoint : null
            //status: status ? status : false
          },
          {
            upsert: false
          },
          function(err, doc) {
            if (err) {
              msg = `Banco de dados nao conseguiu executar a operacao: `;
              Utils.retErr(res, req, 405, msg + err.message);
            } else if (doc.nModified === 0) {
              msg = `Evento com id (${id}) não existe no banco de dados.`;
              Utils.retErr(res, req, 404, msg);
            } else {
              Utils.retOk(res, req, 200, {
                endDate: endDate,
                city: city,
                street: street,
                description: description ? description : undefined,
                neighborhood: neighborhood,
                //eventType: eventType,
                title: title,
                //user: user,
                startDate: startDate,
                referencePoint: referencePoint ? referencePoint : undefined,
                status: status
              });
            }
          }
        );
      }
    } catch (err) {
      msg = "Função updateEvent:\n" + JSON.stringify(err);
      Utils.retErr(res, req, 405, msg);
    }
  },

  async deleteEvent(req, res) {
    let msg = "";
    try {
      //const { api_key } = req.headers;
      const { eventId } = req.params;
      console.log("Metodo invocado: deleteEvent");
      if (!eventId) {
        msg = `Código identificador do Evento não foi fornecido`;
        Utils.retErr(res, req, 400, msg);
      } else {
        Event.deleteOne({ idEvent: eventId }, function(err, doc) {
          if (err) {
            msg = "Banco de dados nao conseguiu realizar a exclusão:";
            Utils.retErr(res, req, 404, msg + err.message);
          } else if (doc.deletedCount === 0) {
            msg = `Nenhum evento foi encontrado no banco de dados com a id ${eventId}.`;
            Utils.retErr(res, req, 404, msg);
          } else {
            msg = `Evento com ID ${eventId} foi removido do banco de dados.`;
            Utils.retOk(res, req, 200, { message: msg });
          }
        });
      }
    } catch (err) {
      msg = "Função deleteEvent:\n" + JSON.stringify(err);
      Utils.retErr(res, req, 404, msg);
    }
  },

  async getEventById(req, res) {
    let msg = "";
    try {
      const { eventId } = req.params;
      console.log("Metodo invocado: getEventById");
      if (!eventId) {
        msg = `Código identificador do Evento não foi fornecido`;
        Utils.retErr(res, req, 400, msg);
      } else {
        Event.find({ idEvent: eventId }).exec((err, evento) => {
          if (err) {
            msg = "Banco de dados nao conseguiu retornar a consulta:";
            Utils.retErr(res, req, 404, msg + err.message);
          } else if (evento.length === 0) {
            msg = `Nenhum evento foi encontrado no banco de dados com a id ${eventId}.`;
            Utils.retErr(res, req, 404, msg);
          } else {
            Utils.retOk(res, req, 404, {
              id: eventId,
              endDate: evento.endDate,
              city: evento.city,
              street: evento.street,
              description: evento.description ? evento.description : undefined,
              neighborhood: evento.neighborhood,
              eventType: evento.eventType, //JOIN
              title: evento.title,
              user: evento.user, //JOIN
              startDate: evento.startDate,
              referencePoint: evento.referencePoint
                ? evento.referencePoint
                : undefined,
              status: evento.status
            });
          }
        });
      }
    } catch (err) {
      msg = "Função getEventById:\n" + JSON.stringify(err);
      Utils.retErr(res, req, 404, msg);
    }
  },

  async getEvent(req, res) {
    let msg = "";
    try {
      Event.find().exec((err, events) => {
        if (err) {
          msg = "Events searched failed!";
          Utils.retErr(res, req, 405, msg);
        } else if (events.length === 0) {
          msg = `Nenhum evento foi encontrado!`;
          Utils.retErr(res, req, 404, msg);
        } else {
          events = Utils.replaceStr(events, ["idEvent"], ["id"]);
          Utils.retOk(res, req, 200, events);
        }
      });
    } catch (err) {
      msg = "Função getEvent:\n" + JSON.stringify(err);
      Utils.retErr(res, req, 405, msg);
    }
  },

  async eventSearchGET(req, res) {
    const rdate = req.swagger.params["rdate"].value;
    const start_date = req.swagger.params["start_date"].value;
    const end_date = req.swagger.params["end_date"].value;
    const event_type = req.swagger.params["event_type"].value;
  }
};
