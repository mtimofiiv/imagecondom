'use strict';

var gm = require('gm');
var request = require('request');
var bytes = require('bytes');
var pjson = require('../package.json');

var ALLOWED_MIME_TYPES = [ 'image/jpeg', 'image/png', 'image/gif' ];
var MAX_CONTENT_LENGTH = bytes(process.env.MAX_SIZE || 10485760);

module.exports = function(req, res) {
  var fragments = req.url.split('/');
  
  if (fragments.length !== 3) {
    res.statusCode = 400;
    return res.end('Invalid request');
  }

  var width = fragments[1];
  var imageUri = new Buffer(fragments[2], 'base64').toString('ascii');
  
  var remoteFile = request.get(imageUri);
  
  remoteFile.on('response', function(response) {
    if (response.statusCode < 200 || response.statusCode > 200) {
      res.statusCode = 400;
      return res.end('Cannot retrieve file');
    }
    
    if (ALLOWED_MIME_TYPES.indexOf(response.headers['content-type']) === -1) {
      res.statusCode = 400;
      return res.end('Invalid file type');
    }
    
    if (response.headers['content-length'] > MAX_CONTENT_LENGTH) {
      res.statusCode = 400;
      return res.end('Requested file is too large');
    }
  });
  
  res.setHeader('proxied-via', 'imagecondom ' + pjson.version);
  res.setHeader('origin-url', imageUri);
  
  var resizing = gm(remoteFile).resize(width).stream();
  
  return resizing.pipe(res);
};
