'use strict';

if (!process.env.PORT) require('dotenv').load();

var http = require('http');
var PORT = process.env.PORT || 9191;
var condom = require('./lib/condom');

http.createServer(condom).listen(PORT, function() {
  console.log('=> Image Condom running on port ', PORT);
});
