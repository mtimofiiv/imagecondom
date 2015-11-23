'use strict';

var gm = require('gm');
var request = require('request');
var bytes = require('bytes');
var url = require('url');
var pjson = require('../package.json');
var Logger = require('./logger');
var validUrl = require('valid-url');

var ALLOWED_MIME_TYPES = [ 'image/jpeg', 'image/png', 'image/gif' ];
var MAX_CONTENT_LENGTH = bytes(process.env.MAX_SIZE || 10485760);

module.exports = function(req, res) {
  var log = new Logger(req);
  var requestUrl = url.parse(req.url);
  var fragments = requestUrl.pathname.split('/');

  if (fragments.length !== 3) {
    res.statusCode = 400;
    log.write('400 Invalid request');
    return res.end('Invalid request');
  }

  var width = fragments[1];
  var imageUri = new Buffer(fragments[2], 'base64').toString('ascii');

  if (width < 1 || !validUrl.isUri(imageUri)) {
    res.statusCode = 400;
    log.write('400 Invalid request');
    return res.end('Invalid request');
  }

  var remoteFile = request.get(imageUri);

  remoteFile.on('response', function(response) {
    if (response.statusCode < 200 || response.statusCode > 200) {
      res.statusCode = 400;
      log.write('400 Cannot retrieve file');
      return res.end('Cannot retrieve file');
    }

    if (ALLOWED_MIME_TYPES.indexOf(response.headers['content-type']) === -1) {
      res.statusCode = 400;
      return res.end('Invalid file type');
    }

    if (response.headers['content-length'] > MAX_CONTENT_LENGTH) {
      res.statusCode = 400;
      log.write('400 Requested file is too large');
      return res.end('Requested file is too large');
    }

    res.setHeader('content-type', response.headers['content-type']);
    res.setHeader('content-length', response.headers['content-length']);
  });

  var resizing = gm(remoteFile).resize(width).stream();

  res.setHeader('proxied-via', 'imagecondom ' + pjson.version);
  res.setHeader('origin-url', imageUri);

  if (requestUrl.query !== 'bypassCache=true') {
    res.setHeader('cache-control', 'public, max-age=14400');
  }

  log.write('200 Served');
  return resizing.pipe(res);
};
