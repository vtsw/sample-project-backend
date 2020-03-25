const { createLogger, format, transports } = require('winston');
const fs = require('fs');
const config = require('../config');
const minio = require('./minio');
require('winston-daily-rotate-file');

const minioClient = minio(config);
const {
  combine, timestamp, json,
} = format;
const { dirname } = config.logs;

const dailyRotateFile = new (transports.DailyRotateFile)(config.logs);

dailyRotateFile.on('archive', (zipFilename) => {
  const fileStream = fs.createReadStream(`${zipFilename}`);
  fs.stat(`${zipFilename}`, (err, stats) => {
    if (err) {
      // eslint-disable-next-line no-console
      return console.log(err);
    }
    // eslint-disable-next-line no-console
    return minioClient.putObject('logs', zipFilename.replace(dirname, ''), fileStream, stats.size, (putErr, etag) => console.log(err, etag));
  });
});

module.exports = createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    json(),
  ),
  transports: [
    dailyRotateFile,
  ],
});
