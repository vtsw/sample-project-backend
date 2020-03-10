module.exports = {
  app: {
    port: 4000,
  },
  mongodb: {
    url: 'mongodb://foobar:foobarPassword@mongodb:27017/simple_db',
  },
  minio: {
    endPoint: 'minio',
    port: 9000,
    useSSL: false,
    accessKey: 'AKIAIOSFODNN7EXAMPLE',
    secretKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  },
  auth: {
    jwt: {
      privateKey: 'privateKey',
      expiresIn: '1d',
    },
    bcrypt: {
      saltRounds: 10,
    },
  },
};
