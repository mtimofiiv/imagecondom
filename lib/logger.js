'use strict';

class Logger {

  write(message) {
    const formatted = `[${new Date()}]${this._request.method} ${this._request.url}`;
    console.log(formatted, message);
  }

}

module.exports = Logger;
