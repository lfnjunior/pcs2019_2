const User = require('../models/User')
const Token = require('../config/Token')

module.exports = {
  async addUser(req, res) {
    try {
      const { username, email, password, birthdate, sex } = req.body

      console.log('Metodo invocado: addUser')

      if (!email || !username || !password) {
        console.log('log: algum parÃ¢metro obrigatÃ³rio estÃ¡ faltando:')
        console.log('username:')
        console.log(username)
        console.log('email:')
        console.log(email)
        console.log('password:')
        console.log(password)
        return res.status(405).json({ description: "Entrada Invalida" })
      }

      if (await User.findOne({ email })) {
        console.log('log: email jÃ¡ estÃ¡ cadastrado')
        return res.status(405).json({ description: "Entrada Invalida" })
      }

      const newUser = {};

      newUser.username = username
      newUser.email = email
      newUser.password = password
      if (birthdate) {
        newUser.birthdate = birthdate
      }
      if (sex) {
        newUser.sex = sex
      }

      const user = await User.create(newUser)

      if (!user) {
        console.log('O usuÃ¡rio nÃ£o foi inserido no banco')
        return res.status(405).json({ description: "Entrada Invalida" })
      }

      //caso retorne o objeto para o lado cliente esconde a senha
      user.password = undefined

      console.log(`UsuÃ¡rio ${user.username} foi gravado no banco de dados.`)

      return res.status(201).json({description : "Evento Criado"})

    } catch (err) {
      console.log('Erro funÃ§Ã£o addUser:')
      console.log(err)
      return res.status(405).json({ description: "Entrada Invalida" })
    }
  },

  async updateUsuario(req, res) {
    try {
      const { id, username, email, password, birthdate, sex } = req.body

      console.log('Metodo invocado: updateUsuario')

      if (!id) {
        return res.status(400).json({ description: 'Invalid ID supplied' })
      }

      if (!email || !username || !password) {
        console.log('Algum parÃ¢metro obrigatÃ³rio estÃ¡ faltando:')
        console.log('username:')
        console.log(username)
        console.log('email:')
        console.log(email)
        console.log('password:')
        console.log(password)
        return res.status(405).json({ description: "Validation exception" })
      }

      User.updateOne({"id" : id}, {
        "username" : username,
        "email" : email,
        "password" : password,
        "birthdate" : (!birthdate) ? null : birthdate,
        "sex" : (!sex) ? null : sex
      }, {
        upsert: false 
      }, function(err, doc){
        if (err) {
          console.log(`Banco de dados nÃ£o conseguiu executar a operaÃ§Ã£o:`)
          console.log(err.message)
          return res.status(405).json({ description: "Validation exception" })
        } 
        if (doc.nModified == 0) {
          console.log(`UsuÃ¡rio com id  ${id} nÃ£o existe no banco de dados.`)
          return res.status(405).json({ description: "Validation exception" })
        }
        console.log(`UsuÃ¡rio ${username} foi atualizado no banco de dados.`)
        return res.status(201).json({description : "Atualizado"})
      })

    } catch (err) {
      console.log('Erro funÃ§Ã£o updateUsuario:')
      console.log(err)
      return res.status(405).json({ description: "Validation exception" })
    }
  },

  async getUserById(req, res) {
    try {
      const { userId } = req.params

      console.log('Metodo invocado: getUserById')

      if (!userId) {
        return res.status(400).json({ description: "Invalid ID supplied" });
      }

      // Perguntar para o pessoal o por que desse retorno
      if (false) {
        return res.status(204).json({ description: "NÃ£o a conteudo para ser entregue"})
      }

      User.find( { "id" : userId }).exec((err, user)=>{
        if (err) {
          console.log(`Banco de dados nÃ£o conseguiu retornar a consulta:`)
          console.log(err.message)
          return res.status(404).json({ description: "Evento nÃ£o Encontrado" })
        }
        if (user.length == 0) {
          console.log(`Nenhum usuÃ¡rio foi encontrado no banco de dados com a id ${userId}.`)
          return res.status(404).json({ description: "Evento nÃ£o Encontrado" })
        } else {
          console.log(`UsuÃ¡rio ${user.username} foi consultado no banco de dados.`)
          return res.status(200).json({ description: "OperacÃ£o Realizada com Sucesso", user })
        }
      })  

    } catch (err) {
      console.log('Erro funÃ§Ã£o getUserById:')
      console.log(err)
      return res.status(404).json({ description: "Evento nÃ£o Encontrado" })
    }
  },

  async deleteUser(req, res) {
    try {
      // Pra que serve?
      const { api_key } = req.headers

      const { userId } = req.params

      console.log('Metodo invocado: deleteUser')
	
      if (!userId) {
        return res.status(400).json({ description: 'Invalid ID supplied' })
      }

      User.deleteOne( { "id" : userId }, 
      function(err, doc){
        if (err) {
          console.log(`Banco de dados nÃ£o conseguiu remover:`)
          console.log(err.message)
          return res.status(404).json({ description: "Evento nÃ£o Encontrado" })
        } if (doc.deletedCount === 0){
          console.log(`Nenhum usuÃ¡rio foi encontrado no banco de dados com a id ${userId}.`)
          return res.status(404).json({ description: "Evento nÃ£o Encontrado" })
        } else {
          console.log(`UsuÃ¡rio com ID ${userId} foi removido do banco de dados.`)
          return res.status(200).json({ description: "Usuario apagado com sucesso" })
        }
      })  
    
    } catch (err) {
      console.log('Erro funÃ§Ã£o deleteUser:')
      console.log(err)
      return res.status(404).json({ description: "Evento nÃ£o Encontrado" })
    }
  },

  async loginUser(req, res) {
    try {
      const { login, password } = req.body

      console.log('Metodo invocado: loginUser')
      
      if (!login || !password) {
        return res.status(400).json({ description: 'Invalid username/password supplied' })
      }

      User.findOne({ $or: [
        { "username" : login },
        { "email" : login }
      ] }, 
      function(err, user){
        if (err) {
          console.log(`Banco de dados nÃ£o conseguiu consultar:`)
          console.log(err.message)
          return res.status(400).json({ description: "Invalid username/password supplied" })
        } if (!user){
          console.log(`O parÃ¢metro login = ${login} nÃ£o Ã© o username nem o email de nenhum usuÃ¡rio cadastrado`)
          return res.status(400).json({ description: "Invalid username/password supplied" })
        } else {
          console.log(`UsuÃ¡rio login = ${login} estÃ¡ cadastrado no sistema`)

          if (!(password === user.password)) {
            console.log(`Mas a senha = ${password} nÃ£o corresponde a senha do usuÃ¡rio = ${user.password}`)
            return res.status(400).json({ description: "Invalid password" })
          }
    

          console.log(`Login efetuado com sucesso`)
          return res.status(200)
          .json({
            description : "successful operation",
            token: Token.generateToken({ id: user._id })
          })

        }

      })

    } catch (err) {
      console.log('Erro funÃ§Ã£o loginUser:')
      console.log(err)
      return res.status(400).json({ description: "Invalid username/password supplied" })
    }
  }

  // async show(req, res) {
  //   try {
  //     let page = Number.parseInt(req.query.page)
  //     let limit = Number.parseInt(req.query.limit)

  //     if (page <= 0 || limit <= 0) {
  //       return res.status(400).json({ description: 'Page and limit must be greater or equal than 1' })
  //     }

  //     let skip = limit * (page - 1)

  //     User.find({ "deletedAt": null }).skip(skip).limit(limit).exec((err, users) => {
  //       if (err) {
  //         return res.status(400).json({ description: 'Users searched failed!' })
  //       }

  //       if (users.length === 0) {
  //         return res.status(400).json({ description: `Page ${page} exceeded existing amount!` })
  //       }

  //       return res.json(users)
  //     })
  //   } catch (description) {
  //     return res.status(400).json({ description: "Users query failed!" })
  //   }
  // },

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
}
