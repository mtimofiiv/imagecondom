'use strict';

const gm = require('gm');
const request = require('request');
const bytes = require('bytes');
const url = require('url');
const pjson = require('../package.json');
const Logger = require('./logger');
const validUrl = require('valid-url');

const ALLOWED_MIME_TYPES = [ 'image/jpeg', 'image/png', 'image/gif' ];
const MAX_CONTENT_LENGTH = bytes(process.env.MAX_SIZE || 10485760);

function testForBadRequests(response) {
  if (response.statusCode < 200 || response.statusCode > 200) return 'Cannot get file';
  if (ALLOWED_MIME_TYPES.indexOf(response.headers['content-type']) === -1) return 'Invalid file type';
  if (response.headers['content-length'] > MAX_CONTENT_LENGTH) return 'File too big';

  return true;
}

module.exports = function(req, res) {
  const log = new Logger(req);
  const requestUrl = url.parse(req.url);
  const fragments = requestUrl.pathname.split('/');

  if (fragments.length !== 3) {
    res.statusCode = 400;
    log.write('400 Invalid request');
    return res.end('Invalid request');
  }

  const width = fragments[1];
  const imageUri = new Buffer(fragments[2], 'base64').toString('ascii');

  if (width < 1 || !validUrl.isUri(imageUri)) {
    res.statusCode = 400;
    log.write('400 Invalid request');
    return res.end('Invalid request');
  }

  const remoteFile = request.get(imageUri);

  remoteFile.on('response', response => {
    const requestIsValid = testForBadRequests(response);

    if (requestIsValid !== true) {
      res.statusCode = 400;
      log.write(requestIsValid);
      return res.send(requestIsValid);
    };

    res.setHeader('content-type', response.headers['content-type']);
  });

  const resizing = gm(remoteFile).resize(width).stream();

  res.setHeader('proxied-via', `imagecondom ${pjson.version}`);
  res.setHeader('origin-url', imageUri);

  if (requestUrl.query !== 'bypassCache=true') {
    res.setHeader('cache-control', 'public, max-age=14400');
  }

  resizing.on('end', () => {
    res.end();
  });

  res.statusCode = 200;
  log.write('200 Served');

  return resizing.pipe(res);
};
