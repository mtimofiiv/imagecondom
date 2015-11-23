'use strict';

var Logger = function(req) {
  this._request = req;
};

Logger.prototype.write = function(message) {
  var formatted = '[' + new Date() + '] ' + this._request.method + ' ' + this._request.url;
  console.log(formatted, message);
};

module.exports = Logger;
