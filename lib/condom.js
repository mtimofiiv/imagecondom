'use strict';

var GM = require('gm').subClass({ imageMagick: true });
var request = require('request');
var fs = require('fs');

module.exports = function(req, res) {
  return res.end('imgcondom');
};
