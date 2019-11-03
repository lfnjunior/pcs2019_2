module.exports = {
   msg(key, text1 = '', text2 = '', text3 = '') {
      let msgRet = ''
      switch (key) {
         case 1:
            msgRet = `Algum dos campos (${text1}) já está sendo utilizado`
            break
         case 2:
            msgRet = `Não foi possível ${text1} o ${text2} no banco de dados: ${text3}`
            break
         case 3:
            msgRet = `Erro função ${text1} : ${text2}`
            break
         case 4:
            msgRet = `Código identificador do ${text1} não foi fornecido`
            break
         case 5:
            msgRet = `${text1} com id (${text2}) não existe no banco de dados.`
            break
         case 6:
            msgRet = `${text1} com id (${text2}) foi removido do banco de dados.`
            break
         case 7:
            msgRet = `Atributo ${text1} = ${text2} não pertence a nenhum ${text3} cadastrado`
            break
         default:
            break
      }
      return msgRet
   }
}
