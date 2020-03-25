const { createLogger, format, transports } = require('winston');
const fs = require('fs');
const config = require('../config');
const minio = require('./minio');
require('winston-daily-rotate-file');

const minioClient = minio(config);
const {
  combine, timestamp, json,
} = format;

const dailyRotateFile = new (transports.DailyRotateFile)({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: true,
  maxSize: '100k',
  maxFiles: '2d',
});

dailyRotateFile.on('archive', async (zipFilename) => {
  const fileStream = fs.createReadStream(`${global.appRoot}/${zipFilename}`);
  fs.stat(`${global.appRoot}/${zipFilename}`, (err, stats) => {
    if (err) {
      return console.log(err);
    }
    return minioClient.putObject('logs', zipFilename.replace('logs/', ''), fileStream, stats.size, (putErr, etag) => console.log(err, etag));
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
