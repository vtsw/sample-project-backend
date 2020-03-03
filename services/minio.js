const Minio = require('minio');

module.exports = (config) => new Minio.Client(config.minio);
