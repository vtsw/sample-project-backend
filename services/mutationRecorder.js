const path = require('path');
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

const APP_ROOT = `${global.APP_ROOT}`;
const mutationRecordConfig = config.app.mutationRecord;
const dirname = path.join(APP_ROOT, mutationRecordConfig.storeDir);
const auditFile = path.join(dirname, mutationRecordConfig.auditFile);
const winstonConfig = {
  ...config.winstonDailyRotate, ...mutationRecordConfig, dirname, auditFile,
};
const mutationRecorder = new (transports.DailyRotateFile)(winstonConfig);
const { mutationRecordMinioBucket } = mutationRecordConfig;

/**
 * After log file is archived, it will uploaded to MinIO server.
 */
mutationRecorder.on('rotate', (oldFileName, newFileName) => {
  const audit = mutationRecorder.logStream.auditLog;
  util.promisify(fs.stat)(`${oldFileName}`)
    .then((stats) => {
      const metadata = { createDate: audit.files.find((file) => file.name === oldFileName).date };
      minioClient.putObject(
        mutationRecordMinioBucket,
        path.basename(oldFileName),
        fs.createReadStream(`${oldFileName}`),
        stats.size,
        metadata,
        () => {},
      );
    })
    // eslint-disable-next-line no-console
    .catch((e) => console.error(e));
});

module.exports = createLogger({
  format: combine(
    timestamp(),
    json(),
  ),
  transports: [
    mutationRecorder,
  ],
});
