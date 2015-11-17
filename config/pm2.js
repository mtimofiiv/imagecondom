'use strict';

var pm2 = require('pm2');

var instances = process.env.WEB_CONCURRENCY || -1;
var maxMemory = process.env.WEB_MEMORY || 512;

pm2.connect(function() {
  pm2.start({
    script: 'app.js',
    exec_mode: 'cluster',
    instances: instances,
    max_memory_restart: maxMemory + 'M'
  }, function(err) {
    if (err) return console.error('Error while launching applications', err.stack || err);
    console.log('PM2 and application has been succesfully started');

    // Display logs in standard output
    pm2.launchBus(function(err, bus) {
      console.log('[PM2] Log streaming started');

      bus.on('log:out', function(packet) {
        console.log(packet.data);
      });

      bus.on('log:err', function(packet) {
        console.error(packet.data);
      });
    });

  });
});
