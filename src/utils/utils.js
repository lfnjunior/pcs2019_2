const protocols = require("./response-protocols");

module.exports = {
  formatDate(date) {
    var d = new Date(date),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();
    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;
    return [year, month, day].join("-");
  },

  replaceStr(json, oldStr, newStr) {
    let str = JSON.stringify(json);
    for (let i = 0; i < oldStr.length; i++) {
      str = str.replace(new RegExp(oldStr[i], "g"), newStr[i]);
    }
    return JSON.parse(str);
  },

  retErr(res, req, statusCode, msg) {
    let path = req.route.path;
    let method = req.method.toLowerCase();
    let desc =
      protocols.paths[`${path}`].methods[`${method}`].responses[`${statusCode}`]
        .description;
    console.log(desc);
    console.log(msg);
    return res.status(statusCode).json({ description: desc, message: msg });
  },

  retOk(res, req, statusCode, obj) {
    let path = req.route.path;
    let method = req.method;
    let nomeObj = null;
    let acao = null;
    let final = "o";
    let msg = "";

    switch (path) {
      case "/event":
        nomeObj = "Evento";
        break;
      case "/tipoEvento":
        nomeObj = "Tipo de Evento";
        acao = "consultad";
        break;
      case "/event/search":
        nomeObj = "Evento";
        break;
      case "/user":
        nomeObj = "Usuário";
        break;
      case "/user/:userId":
        nomeObj = "Usuário";
        break;
      case "/user/login":
        nomeObj = "Usuário";
        acao = "autenticad";
        break;
      case "/mensagem":
        nomeObj = "Mensagem";
        final = "a";
        break;
      default:
        break;
    }

    switch (method) {
      case "POST":
        acao = "gravad";
        break;
      case "PUT":
        acao = "atualizad";
        break;
      case "DELETE":
        acao = "deletad";
        break;
      case "GET":
        acao = "consultad";
        break;
      default:
        break;
    }

    if (nomeObj && acao)
      msg =
        statusCode + " - " + nomeObj + " foi " + acao + final + " com sucesso!";

    console.log(msg);

    if (path === "/user" && method === "POST" && statusCode === 201) {
      obj.password = "Sua senha está segura em nossa base de dados! :D";
      obj.password = obj.password ? obj.password : undefined;
      obj.sex = obj.sex ? obj.sex : undefined;
    }

    return res.status(statusCode).json(obj);
  }
};
