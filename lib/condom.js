'use strict';

var GM = require('gm').subClass({ imageMagick: true });
var request = require('request');
var fs = require('fs');

module.exports = function(req, res) {
  var fragments = req.url.split('/');

  if (fragments.length !== 3) return res.end('Invalid request');

  var width = fragments[1];
  var imageUri = new Buffer(fragments[2], 'base64').toString('ascii');
  var filename = new Date();
  
  request.get(imageUri).pipe(fs.createWriteStream());
  
  return res.end('imgcondom');
};
