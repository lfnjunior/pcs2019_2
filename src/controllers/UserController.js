const User = require("../models/User");
const Token = require("../config/Token");
const Utils = require("../utils/utils");

module.exports = {
  async addUser(req, res) {
    let msg = "";
    try {
      let newUser = {};
      newUser = {
        id: 0,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        birthdate: req.body.birthdate ? req.body.birthdate : null,
        sex: req.body.sex ? req.body.sex : null
      };
      console.log("Metodo invocado: addUser");
      if (!newUser.email || !newUser.username || !newUser.password) {
        msg =
          `Algum parametro obrigatorio esta faltando, ` +
          `de acordo com a estrutura do Objeto User, ` +
          `os campos (username, email e senha) são ` +
          `obrigatórios:\n ` +
          `username: ${newUser.username}\n ` +
          `email: ${newUser.email}\n ` +
          `password: ${newUser.password}`;
        Utils.retErr(res, req, 405, msg);
      } else if (
        await User.findOne({
          $or: [{ username: newUser.username }, { email: newUser.email }]
        })
      ) {
        msg = `Algum dos campos (username / email) já está sendo utilizado por outra conta`;
        Utils.retErr(res, req, 405, msg);
      } else {
        User.create(newUser, function(err, user) {
          if (err) {
            msg = `O Usuario nao foi inserido no banco: ${err.message}`;
            Utils.retErr(res, req, 405, msg);
          } else {
            newUser.id = user.idUser;
            Utils.retOk(res, req, 201, newUser);
          }
        });
      }
    } catch (err) {
      msg = "Função addUser: \n" + JSON.stringify(err);
      Utils.retErr(res, req, 405, msg);
    }
  },

  async updateUsuario(req, res) {
    let msg = "";
    try {
      const { id, username, email, password, birthdate, sex } = req.body;
      console.log("Metodo invocado: updateUsuario");
      if (!id) {
        msg = `Código identificador do Usuário não foi fornecido`;
        Utils.retErr(res, req, 400, msg);
      } else if (!email || !username || !password) {
        msg =
          `Algum parametro obrigatorio esta faltando, ` +
          `de acordo com a estrutura do Objeto User, ` +
          `os campos (username, email e senha) são obrigatórios:\n ` +
          `username: ${username}\n ` +
          `email: ${email}\n ` +
          `password: ${password}`;
        Utils.retErr(res, req, 405, msg);
      } else if (
        await User.findOne({
          $and: [
            { $or: [{ username: username }, { email: email }] },
            { idUser: { $ne: id } }
          ]
        })
      ) {
        msg = `Algum dos campos (username / email) já está sendo utilizado por outra conta`;
        Utils.retErr(res, req, 405, msg);
      } else {
        User.updateOne(
          { idUser: id },
          {
            username: username,
            email: email,
            password: password,
            birthdate: !birthdate ? null : birthdate,
            sex: !sex ? null : sex
          },
          {
            upsert: false
          },
          function(err, doc) {
            if (err) {
              msg = `Banco de dados nao conseguiu executar a operacao: `;
              Utils.retErr(res, req, 405, msg + err.message);
            } else if (doc.nModified === 0) {
              msg = `Usuário com id (${id}) não existe no banco de dados.`;
              Utils.retErr(res, req, 404, msg);
            } else {
              Utils.retOk(res, req, 200, {
                id,
                username: username,
                email: email,
                password: "Sua senha está segura em nossa base de dados! :D",
                birthdate: birthdate ? Utils.formatDate(birthdate) : undefined,
                sex: sex ? sex : undefined
              });
            }
          }
        );
      }
    } catch (err) {
      msg = "Função updateUsuario:\n" + JSON.stringify(err);
      Utils.retErr(res, req, 405, msg);
    }
  },

  async getUserById(req, res) {
    let msg = "";
    try {
      const { userId } = req.params;
      console.log("Metodo invocado: getUserById");
      if (!userId) {
        msg = `Código identificador do Usuário não foi fornecido`;
        Utils.retErr(res, req, 400, msg);
      } else {
        User.find({ idUser: userId }).exec((err, user) => {
          if (err) {
            msg = "Banco de dados nao conseguiu retornar a consulta:";
            Utils.retErr(res, req, 404, msg + err.message);
          } else if (user.length === 0) {
            msg = `Nenhum usuário foi encontrado no banco de dados com a id ${userId}.`;
            Utils.retErr(res, req, 404, msg);
          } else {
            Utils.retOk(res, req, 200, {
              id: userId,
              username: user[0].username,
              email: user[0].email,
              password: user[0].password,
              birthdate: user[0].birthdate
                ? Utils.formatDate(user[0].birthdate)
                : undefined,
              sex: user[0].sex ? user[0].sex : undefined
            });
          }
        });
      }
    } catch (err) {
      msg = "Função getUserById:\n" + JSON.stringify(err);
      Utils.retErr(res, req, 404, msg);
    }
  },

  async deleteUser(req, res) {
    let msg = "";
    try {
      // Pra que serve?
      //const { api_key } = req.headers;
      const { userId } = req.params;
      console.log("Metodo invocado: deleteUser");
      if (!userId) {
        msg = `Código identificador do Usuário não foi fornecido`;
        Utils.retErr(res, req, 400, msg);
      } else {
        User.deleteOne({ idUser: userId }, function(err, doc) {
          if (err) {
            msg = "Banco de dados nao conseguiu realizar a exclusão:";
            Utils.retErr(res, req, 404, msg + err.message);
          } else if (doc.deletedCount === 0) {
            msg = `Nenhum usuário foi encontrado no banco de dados com a id ${userId}.`;
            Utils.retErr(res, req, 404, msg);
          } else {
            msg = `Usuario com ID ${userId} foi removido do banco de dados.`;
            Utils.retOk(res, req, 200, { message: msg });
          }
        });
      }
    } catch (err) {
      msg = "Função deleteUser:\n" + JSON.stringify(err);
      Utils.retErr(res, req, 404, msg);
    }
  },

  async loginUser(req, res) {
    let msg = "";
    try {
      const { login, senha } = req.body;
      console.log("Metodo invocado: loginUser");
      if (!login || !senha) {
        msg = `Invalid username/senha supplied`;
        Utils.retErr(res, req, 400, msg);
      } else {
        User.findOne({
          $or: [{ username: login }, { email: login }]
        })
          .select("+password")
          .exec(function(err, user) {
            if (err) {
              msg = "Banco de dados nao conseguiu realizar a autenticação:";
              Utils.retErr(res, req, 400, msg + err.message);
            } else if (!user) {
              msg = `O parametro login = ${login} não pertence a nenhum usuário cadastrado`;
              Utils.retErr(res, req, 400, msg);
            } else {
              if (!(senha === user.password)) {
                msg = `Senha incorreta`;
                Utils.retErr(res, req, 400, msg);
              } else {
                Utils.retOk(res, req, 200, {
                  description: "Usuario logado com sucesso"
                  //token: Token.generateToken({ idUser: user._id })
                });
              }
            }
          });
      }
    } catch (err) {
      msg = "Função loginUser:\n" + JSON.stringify(err);
      Utils.retErr(res, req, 404, msg);
    }
  },

  async getUsers(req, res) {
    let msg = "";
    try {
      let page = req.query.page;
      let limit = req.query.limit;
      page = page > 0 ? page : 1;
      limit = limit > 0 ? limit : 100;
      let skip = limit * (page - 1);
      var usersProjection = {
        password: false,
        _id: false
      };
      User.find({}, usersProjection)
        .skip(skip)
        .limit(limit)
        .exec((err, users) => {
          if (err) {
            msg = "Users searched failed!";
            Utils.retErr(res, req, 400, msg);
          } else if (users.length === 0) {
            msg = `Page ${page} exceeded existing amount!`;
            Utils.retErr(res, req, 400, msg);
          } else {
            users = Utils.replaceStr(
              users,
              ["idUser", "T00:00:00.000Z"],
              ["id", ""]
            );
            Utils.retOk(res, req, 200, users);
          }
        });
    } catch (err) {
      msg = "Função getUsers:\n" + JSON.stringify(err);
      Utils.retErr(res, req, 400, msg);
    }
  }

  // get => /user/filter
  // async filter(req,res) {
  //   try {
  //     const { op, dt } = req.query
  //     User.find( { "deletedAt" : null, "createdAt" : { "$gte" : new Date(dt).toISOString() } }).exec((err, users)=>{
  //       if (err) {
  //         return res.status(400).json( { description : 'Users searched failed!' } )
  //       }
  //       return res.json(users)
  //     })
  //   } catch (description) {
  //     return res.status(400).json({ description: "Users query failed!" })
  //   }
  // }
};
