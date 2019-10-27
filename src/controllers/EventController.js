const Event = require("../models/Event");
const Utils = require("../utils/utils");

module.exports = {
  async addEvent(req, res) {
    try {
      const { username, email, password, birthdate, sex } = req.body;
      let msg = "";
      console.log("Metodo invocado: addUser");
      if (!email || !username || !password) {
        msg = `description: Entrada Invalida - Algum parametro obrigatorio esta faltando, de acordo com a estrutura do Objeto User, os campos (username, email e senha) são obrigatórios:\n username: ${username}\n email: ${email}\n password: ${password}`");
        console.log(msg);
        return res.status(405).json({message:msg});
      } else if (await User.findOne({ $or: [{ username: username }, { email: email }] })) {
        msg = `description: Entrada Invalida - Algum dos campos (username / email) já está sendo utilizado por outra conta`
        console.log(msg);
        return res.status(405).json({message:msg});
      }else {
        const newUser = {};
        newUser.username = username;
        newUser.email = email;
        newUser.password = password;
        newUser.birthdate = birthdate ? birthdate : null;
        newUser.sex = sex ? sex : null;
        User.create(newUser, function(err, user) {
          if (err) {
            msg = "description: Entrada Invalida - O Usuario nao foi inserido no banco";
            console.log(msg+err.message);
            return res.status(405).json({ message : msg });
          } else {
            console.log(`Usuario ${user.username} foi gravado no banco de dados.`);
            return res.status(201).json({
              id: user.idUser,
              username: user.username,
              email: user.email,
              password: "Sua senha está segura em nossa base de dados! :D",
              birthdate: user.birthdate
                ? Utils.formatDate(user.birthdate)
                : undefined,
              sex: user.sex ? sex : undefined
            });
          }
        });
      }
    } catch (err) {
      console.log("Erro funcao addUser:\n"+JSON.stringify(err));
      return res.status(405).json({ message : "description: Validation exception - tente novamente mais tarde" });
    }
  },

  async deleteEvent(req, res) {
    const eventId = req.swagger.params["eventId"].value;
    const api_key = req.swagger.params["api_key"].value;
  },

  async eventSearchGET(req, res) {
    const rdate = req.swagger.params["rdate"].value;
    const start_date = req.swagger.params["start_date"].value;
    const end_date = req.swagger.params["end_date"].value;
    const event_type = req.swagger.params["event_type"].value;
  },

  async getEvent(req, res) {},

  async getEventById(req, res) {
    const eventId = req.swagger.params["eventId"].value;
  },

  async updateEvent(req, res) {
    const body = req.swagger.params["body"].value;
  }
};
