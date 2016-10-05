'use strict';

const pm2 = require('pm2');

const instances = process.env.WEB_CONCURRENCY || -1;
const maxMemory = process.env.WEB_MEMORY || 512;

pm2.connect(() => {
  pm2.start({
    exec_mode: 'cluster',
    instances: instances,
    max_memory_restart: `${maxMemory}M`,
    script: 'app.js'
  }, err => {
    if (err) return console.error('Error while launching applications', err.stack || err);
    console.log('PM2 and application has been succesfully started');

    // Display logs in standard output
    pm2.launchBus((err, bus) => {
      console.log('[PM2] Log streaming started');

      bus.on('log:out', packet => {
       console.log(packet.data);
      });

      bus.on('log:err', packet => {
        console.error(packet.data);
      });
    });

  });
});
