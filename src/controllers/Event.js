'use strict';

module.exports.addEvent = function addEvent (req, res, next) {
  var body = req.swagger.params['body'].value;
};

module.exports.deleteEvent = function deleteEvent (req, res, next) {
  var eventId = req.swagger.params['eventId'].value;
  var api_key = req.swagger.params['api_key'].value;
};

module.exports.eventSearchGET = function eventSearchGET (req, res, next) {
  var rdate = req.swagger.params['rdate'].value;
  var start_date = req.swagger.params['start_date'].value;
  var end_date = req.swagger.params['end_date'].value;
  var event_type = req.swagger.params['event_type'].value;
};

module.exports.getEvent = function getEvent (req, res, next) {

};

module.exports.getEventById = function getEventById (req, res, next) {
  var eventId = req.swagger.params['eventId'].value;
};

module.exports.updateEvent = function updateEvent (req, res, next) {
  var body = req.swagger.params['body'].value;
};
