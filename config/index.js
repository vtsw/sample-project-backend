/* eslint-disable */

module.exports = {
  app: {
    port: parseInt(process.env.APP_PORT, 10) || 80,
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
    accessKey: process.env.MINIO_ACCESS_KEY || 'sampleAccessKey',
    secretKey: process.env.MINIO_SECRET_KEY || 'sampleSecretKey',
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
  serviceProviders: [
    require('../services/ThirdPartyServiceProvider'),
    require('../modules/zalo/ZaloServiceProvider'),
    require('../modules/zaloMessage/ZaloMessageServiceProvider'),
    require('../modules/user/UserServiceProvider'),
    require('../modules/message/MessageServiceProvider')
  ],
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT ||  '32768',
  },
  zaloApi: {
    social: {},
    officialAccount: {
      getInterestedUserProfile: "https://openapi.zalo.me/v2.0/oa/getprofile",
      sendMessageToInterestedUser: "https://openapi.zalo.me/v2.0/oa/message"
    },
    accessToken: "TA_EUuIUJZbsgSL_Xvz5EtAlptoR_p5YDP7h8uAaRMSZxAzHb99tPW3Qis-MaZX5VFs-M8g9E5a8zFuS_ASLC5RoaY-eWsCf5i6KQkRmU7fOhv92pS151KQscZJmz4HgViMWVU6qHKbVyA1B_QDvMrVDYnZOl7ycMi-b1wslJoKacwqoa_5E0WMKkGUafJq-39hw0A7-S48yjv10o_PW7dg7fnpwwqCyV8-o7S_4Dnqbyin3WvWN01sdpHtib4PSKlQ47zV8NWTJkO0YqzTg1Mh71xDpW8PAFW"
  }
};
