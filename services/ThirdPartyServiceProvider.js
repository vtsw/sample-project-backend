const { asClass, asValue, asFunction } = require('awilix');
const { GraphQLSchema } = require('graphql');
const { RedisPubSub } = require('graphql-redis-subscriptions');
const fetch = require('node-fetch');
const kue = require('kue');
const Redis = require('ioredis');
const winston = require('./winston');
const Bcrypt = require('./bcrypt');
const JWT = require('./jwt');
const mongodb = require('./mongodb');
const minio = require('./minio');
const ServiceProvider = require('../ServiceProvider');

class ThirdPartyServiceProvider extends ServiceProvider {
  register() {
    this.container.register({
      jwt: asClass(JWT).singleton(),
      bcrypt: asClass(Bcrypt).singleton(),
    });
  }

  async boot() {
    const config = this.container.resolve('config');
    const pubsub = new RedisPubSub({
      publisher: new Redis(config.redis),
      subscriber: new Redis(config.redis),
    });
    const db = await mongodb(config);
    const minioClient = minio(config);
    const loggingQueue = kue.createQueue({ redis: config.redis });
    const winstonLogger = winston(minioClient, config);
    loggingQueue.process('logging', (job, done) => {
      winstonLogger.log(job.data);
      done();
    });
    this.container.register({
      db: asValue(db),
      pubsub: asValue(pubsub),
      fetch: asValue(fetch),
      minio: asValue(minioClient),
      logger: asFunction(() => ({
        log: (logData) => {
          const clonedData = { level: logData.level, message: { ...logData.message } };
          if (clonedData.message && (clonedData.message.schema instanceof GraphQLSchema)) {
            delete clonedData.message.schema;
          }
          loggingQueue.create('logging', clonedData).save((err) => {
            if (err) {
              console.log(err);
            }
          });
        },
      })).singleton(),
    });
  }
}

module.exports = ThirdPartyServiceProvider;
