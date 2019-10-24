'use strict';

module.exports.addMensagem = function addMensagem (req, res, next) {
  var body = req.swagger.params['body'].value;
};

module.exports.deleteMensagem = function deleteMensagem (req, res, next) {
  var msgId = req.swagger.params['msgId'].value;
  var api_key = req.swagger.params['api_key'].value;
};

module.exports.updateMessage = function updateMessage (req, res, next) {
  var body = req.swagger.params['body'].value;
};
