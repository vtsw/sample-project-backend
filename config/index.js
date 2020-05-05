module.exports = {
  app: {
    port: parseInt(process.env.APP_PORT, 10) || 4001,
    env: process.env.NODE_ENV || 'development',
    host: process.env.APP_HOST || 'http://localhost',
  },
  mongodb: {
    url: process.env.MONGODB_URL || 'mongodb://foobar:foobarPassword@mongodb:27017/simple_db',
  },
  minio: {
    endPoint: process.env.MINIO_END_POINT || 'minio',
    port: parseInt(process.env.MINIO_PORT, 10) || 9000,
    useSSL: process.env.MINIO_USE_SSL === 'true' || false,
    accessKey: process.env.MINIO_ACCESS_KEY || 'EGN382IMEPNND2JB46PQ',
    secretKey: process.env.MINIO_SECRET_KEY || '5NwA8Cqx2QCJLa8u3SGUwSzRiKs6DhwbBsbpNbkM',
    publicEndPoint: process.env.MINIO_PUBLIC_END_POINT || 'localhost',
  },
  auth: {
    jwt: {
      privateKey: process.env.JWT_PRIVATE_KEY || 'privateKey',
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    },
    bcrypt: {
      saltRounds: parseInt(process.env.BCRYPT_SALT_ROUND, 10) || 10,
    },
  },
  // https://github.com/winstonjs/winston-daily-rotate-file#options
  winstonDailyRotate: {
    filename: process.env.LOG_FILENAME || 'application-%DATE%.log',
    dirname: process.env.LOG_DIRNAME || 'logs',
    datePattern: process.env.DATE_PATTERN || 'YYYY-MM-DD-HH',
    zippedArchive: process.env.ZIPPED_ARCHIVE === 'true',
    maxSize: process.env.MAX_SIZE || '20m',
    maxFiles: process.env.MAX_FILE || '14d',
    auditFile: process.env.AUDIT_FILE || 'audit.json',
    frequency: process.env.LOG_FREQUENCY || null,
    utc: process.env.LOG_UTC === 'true',
  },
  graphqlUploadExpress: { maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10000000, maxFiles: parseInt(process.env.MAX_FILES, 10) || 10 },
};
