module.exports = {
  app: {
    // eslint-disable-next-line radix
    port: parseInt(process.env.APP_PORT) || 4000,
    mode: process.env.NODE_ENV || 'development',
  },
  mongodb: {
    url: process.env.MONGODB_URL || 'mongodb://foobar:foobarPassword@mongodb:27017/simple_db',
  },
  minio: {
    endPoint: process.env.MINIO_END_POINT || 'minio',
    // eslint-disable-next-line radix
    port: parseInt(process.env.MINIO_PORT) || 9000,
    useSSL: process.env.MINIO_USE_SSL === 'true' || false,
    accessKey: process.env.MINIO_ACCESS_KEY || 'AKIAIOSFODNN7EXAMPLE',
    secretKey: process.env.MINIO_SECRET_KEY || 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  },
  auth: {
    jwt: {
      privateKey: process.env.JWT_PRIVATE_KEY || 'privateKey',
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    },
    bcrypt: {
      saltRounds: process.env.BCRYPT_SALT_ROUND || 10,
    },
  },
};
