const { createLogger, format, transports } = require('winston');
const util = require('util');
const fs = require('fs');
const config = require('../config');
const minio = require('./minio');
require('winston-daily-rotate-file');

const minioClient = minio(config);
const {
  combine, timestamp, json,
} = format;
const dirname = `${global.APP_ROOT}/${config.winstonDailyRotate.dirname}/`;
const { zippedArchive } = config.winstonDailyRotate;
const auditFile = `${global.APP_ROOT}/${config.winstonDailyRotate.dirname}/${config.winstonDailyRotate.auditFile}`;

const dailyRotateFile = new (transports.DailyRotateFile)({ ...config.winstonDailyRotate, dirname, auditFile });

/**
 * After log file is archived, it will uploaded to MinIO server.
 */
dailyRotateFile.on('archive', (zipFilename) => {
  const audit = dailyRotateFile.logStream.auditLog;
  util.promisify(fs.stat)(`${zipFilename}`)
    .then((stats) => minioClient.putObject(
      'logs',
      zipFilename.replace(dirname, ''),
      fs.createReadStream(`${zipFilename}`),
      stats.size,
      audit.files.find((item) => (item.name === (zippedArchive ? zipFilename.replace('.gz', '') : zipFilename))),
    ))
    // eslint-disable-next-line no-console
    .catch((e) => console.error(e));
});

module.exports = createLogger({
  format: combine(
    timestamp(),
    json(),
  ),
  transports: [
    dailyRotateFile,
  ],
});