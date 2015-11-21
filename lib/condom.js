'use strict';

var gm = require('gm');
var request = require('request');
var fs = require('fs');

module.exports = function(req, res) {
  var fragments = req.url.split('/');

  if (fragments.length !== 3) return res.end('Invalid request');

  var width = fragments[1];
  var imageUri = new Buffer(fragments[2], 'base64').toString('ascii');
  
  var remoteFile = request(imageUri);
  var resizing = gm(remoteFile).resize(width).stream();
  
  return resizing.pipe(res);
};
