const BD = 'banco de dados'

module.exports = {
   msg(key, text1 = '', text2 = '', text3 = '') {
      let msgRet = ''
      switch (key) {
         case 1:
            msgRet = `O campo ${text1} = ${text2}, já está sendo utilizado por outro ${text3}`
            break
         case 2:
            msgRet = `Não foi possível ${text1} o ${text2} no ${BD}: ${text3}`
            break
         case 3:
            msgRet = `Erro função ${text1} : ${text2}`
            break
         case 4:
            msgRet = `Código identificador do ${text1} não foi fornecido`
            break
         case 5:
            msgRet = `Não foi encontrado ${text1} com id = ${text2} no ${BD}.`
            break
         case 6:
            msgRet = `${text1} com id (${text2}) foi removido do ${BD}.`
            break
         case 7:
            msgRet = `Atributo ${text1} = ${text2} não pertence a nenhum ${text3} cadastrado`
            break
         case 8:
            msgRet = `Não foi possível ${text1} os ${text2}s no ${BD}: ${text3}`
            break
         case 10:
            msgRet = `Nenhum ${text1} foi encontrado no ${BD}`
            break
         case 11:
            msgRet = `O ${text1} com id ${text2} já está sendo usando pelo cadastro de ${text3}, não será possível realizar a exclusão por questões de integridade referencial!`
            break
         case 12:
            msgRet = `Nenhuma ${text1} foi encontrada no ${BD} para o ${text2} informado`
            break
         case 13:
            msgRet = `O usuário = ${text1} já está participando do evento = ${text2}`
            break
         default:
            break
      }
      return msgRet
   }
}
