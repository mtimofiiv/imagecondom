'use strict';

if (!process.env.PORT) require('dotenv').load();

const http = require('http');
const PORT = process.env.PORT || 9191;
const condom = require('./lib/condom');

http.createServer(condom).listen(PORT, () => {
  console.log(`${new Date()} - INFO - Image Condom running on port`, PORT);
});
