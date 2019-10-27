const User = require("../models/User");
const Token = require("../config/Token");
const Utils = require("../utils/utils");

module.exports = {
  async addUser(req, res) {
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

  async updateUsuario(req, res) {
    try {
      const { id, username, email, password, birthdate, sex } = req.body;
      let msg = "";
      console.log("Metodo invocado: updateUsuario");
      if (!id) {
        msg =`description: Invalid ID supplied - Código identificador do Usuário não foi fornecido`;
        return res.status(400).json({mensagem: msg});
      } else if (!email || !username || !password) {
        msg = `description: Validation exception - Algum parametro obrigatorio esta faltando, de acordo com a estrutura do Objeto User, os campos (username, email e senha) são obrigatórios:\n username: ${username}\n email: ${email}\n password: ${password}`");
        console.log(msg);
        return res.status(405).json({message:msg});
      } else if (
        await User.findOne({
          $and: [
            { $or: [{ username: username }, { email: email }] },
            { idUser: { $ne: id } }
          ]
        })
      ) {
        msg = `description: Entrada Invalida - Algum dos campos (username / email) já está sendo utilizado por outra conta`
        console.log(msg);
        return res.status(405).json({message:msg});
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
              msg = `description: Validation exception - Banco de dados nao conseguiu executar a operacao: ${err.message}`
              console.log();
              return res.status(405).json({message:msg});
            } else if (doc.nModified === 0) {
              msg = `description: Usuario não encontrado - Usuário com id (${id}) não existe no banco de dados.`
              console.log(msg);
              return res.status(404).json({message: msg});
            } else {
              console.log(`Usuario ${username} foi atualizado no banco de dados.`);
              return res.status(200).json({
                description: "Usuário Atualizado",
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
      console.log("Erro funcao updateUsuario:\n"+JSON.stringify(err));
      return res.status(405).json({ message : "description: Validation exception - tente novamente mais tarde" });
    }
  },

  async getUserById(req, res) {
    try {
      const { userId } = req.params;
      console.log("Metodo invocado: getUserById");
      if (!userId) {
        return res.status(400).json({ description: "Invalid ID supplied" });
      } else if (false) {
        return res //POR QUE ESSE RETORNO?
          .status(204)
          .json({ description: "Nao a conteudo para ser entregue" });
      } else {
        User.find({ idUser: userId }).exec((err, user) => {
          if (err) {
            console.log(`Banco de dados nao conseguiu retornar a consulta:`);
            console.log(err.message);
            return res
              .status(404)
              .json({ description: "Usuário nao Encontrado" });
          } else if (user.length === 0) {
            console.log(
              `Nenhum usuario foi encontrado no banco de dados com a id ${userId}.`
            );
            return res
              .status(404)
              .json({ description: "Usuário nao Encontrado" });
          } else {
            console.log(
              `Usuario ${user[0].username} foi consultado no banco de dados.`
            );
            return res.status(200).json({
              description: "Operacão Realizada com Sucesso",
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
      console.log("Erro funcao getUserById:");
      console.log(err);
      return res.status(404).json({ description: "Usuário nao Encontrado" });
    }
  },

  async deleteUser(req, res) {
    try {
      // Pra que serve?
      //const { api_key } = req.headers;
      const { userId } = req.params;
      console.log("Metodo invocado: deleteUser");
      if (!userId) {
        return res.status(400).json({ description: "Invalid ID supplied" });
      } else {
        User.deleteOne({ idUser: userId }, function(err, doc) {
          if (err) {
            console.log(`Banco de dados nao conseguiu remover:`);
            console.log(err.message);
            return res
              .status(404)
              .json({ description: "Usuário nao Encontrado" });
          } else if (doc.deletedCount === 0) {
            console.log(
              `Nenhum usuario foi encontrado no banco de dados com a id ${userId}.`
            );
            return res
              .status(404)
              .json({ description: "Usuário nao Encontrado" });
          } else {
            console.log(
              `Usuario com ID ${userId} foi removido do banco de dados.`
            );
            return res
              .status(200)
              .json({ description: "Usuario apagado com sucesso" });
          }
        });
      }
    } catch (err) {
      console.log("Erro funcao deleteUser:");
      console.log(err);
      return res.status(404).json({ description: "Usuário nao Encontrado" });
    }
  },

  async loginUser(req, res) {
    try {
      const { login, senha } = req.body;
      console.log("Metodo invocado: loginUser");
      if (!login || !senha) {
        return res
          .status(400)
          .json({ description: "Invalid username/senha supplied" });
      } else {
        User.findOne({
          $or: [{ username: login }, { email: login }]
        })
          .select("+password")
          .exec(function(err, user) {
            if (err) {
              console.log(`Banco de dados nao conseguiu consultar:`);
              console.log(err.message);
              return res
                .status(400)
                .json({ description: "Invalid username/password supplied" });
            } else if (!user) {
              console.log(
                `O parametro login = ${login} nao e o username nem o email de nenhum usuario cadastrado`
              );
              return res
                .status(400)
                .json({ description: "Invalid username/password supplied" });
            } else {
              console.log(
                `Usuario login = ${login} esta cadastrado no sistema`
              );
              console.log(user);
              if (!(senha === user.password)) {
                console.log(
                  `Mas a senha = ${senha} nao corresponde a senha do usuario = ${
                    user.password
                  }`
                );
                return res
                  .status(400)
                  .json({ description: "Invalid password" });
              } else {
                console.log(`Login efetuado com sucesso`);
                return res.status(200).json({
                  description: "Usuario logado com sucesso"
                  //token: Token.generateToken({ idUser: user._id })
                });
              }
            }
          });
      }
    } catch (err) {
      console.log("Erro funcao loginUser:");
      console.log(err);
      return res
        .status(400)
        .json({ description: "Invalid username/password supplied" });
    }
  },

  async getUsers(req, res) {
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
            console.log("Erro funcao loginUser:");
            console.log(err);
            return res
              .status(400)
              .json({ description: "Users searched failed!" });
          } else if (users.length === 0) {
            return res
              .status(400)
              .json({ description: `Page ${page} exceeded existing amount!` });
          } else {
            return res
              .status(200)
              .json(
                Utils.replaceStr(
                  users,
                  ["idUser", "T00:00:00.000Z"],
                  ["id", ""]
                )
              );
          }
        });
    } catch (err) {
      console.log("Erro funcao loginUser:");
      console.log(err);
      return res.status(400).json({ description: "Users query failed!" });
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
