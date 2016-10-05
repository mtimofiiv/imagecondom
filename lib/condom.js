'use strict';

const gm = require('gm');
const request = require('request');
const bytes = require('bytes');
const url = require('url');
const pjson = require('../package.json');
const validUrl = require('valid-url');
const stream = require('stream');

const ALLOWED_MIME_TYPES = [ 'image/jpeg', 'image/png', 'image/gif' ];
const MAX_CONTENT_LENGTH = bytes(process.env.MAX_SIZE || 10485760);

function testForBadRequests(response) {
  if (response.statusCode < 200 || response.statusCode > 200) return 'Cannot get file';
  if (ALLOWED_MIME_TYPES.indexOf(response.headers['content-type']) === -1) return 'Invalid file type';
  if (response.headers['content-length'] > MAX_CONTENT_LENGTH) return 'File too big';

  return true;
}

function log(vars) {
  if (Object.keys(console).indexOf(vars.level) === -1) vars.level = 'info';
  if (!vars.message) vars.message = '';

  let line = `${new Date()} - ${vars.level.toUpperCase()} - `;

  if (vars.code) line += `${vars.code} `;
  if (vars.url) line += `${vars.url} `;
  if (vars.image) line += `(${vars.image}) `;

  line += vars.message;

  console[vars.level](line);
}

module.exports = function(req, res) {
  const requestUrl = url.parse(req.url);
  const fragments = requestUrl.pathname.split('/');

  if (fragments.length !== 3) {
    log({
      code: 400,
      level: 'error',
      message: 'A required parameter is missing',
      url: req.url
    });

    res.statusCode = 400;
    return res.end('Invalid request');
  }

  const width = fragments[1];
  const imageUri = new Buffer(fragments[2], 'base64').toString('ascii');

  if (width < 1 || !validUrl.isUri(imageUri)) {
    log({
      code: 400,
      level: 'error',
      message: 'Image URL not valid',
      url: req.url,
      image: imageUri
    });

    res.statusCode = 400;
    return res.end('Invalid request');
  }

  const remoteImage = request(imageUri);

  remoteImage.on('response', response => {
    const requestIsValid = testForBadRequests(response);

    if (requestIsValid !== true) {
      log({
        code: 400,
        level: 'error',
        message: `Image not valid: ${requestIsValid}`,
        url: req.url,
        image: imageUri
      });

      res.statusCode = 400;
      return res.end(requestIsValid);
    };
  });

  log({
    code: 200,
    url: req.url,
    image: imageUri
  });

  return gm(remoteImage).resize(width).stream().pipe(res);
};
