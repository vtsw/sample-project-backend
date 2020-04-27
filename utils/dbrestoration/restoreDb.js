const bootstrapper = require('./bootstrapper.tmp');
const { getObjects, getObjectList, parseObject } = require('./mutationRecordLoader');
const config = require('../../config');
const resolvers = require('../../modules/resolver');
const moment = require('moment');
const { getDateOnDuration } = require('./helper');
const { flatten } = require('lodash');

const setupConfig = () => {
  config.mongodb.dbname = 'simple_db_backup';
  config.middlewares = ['validation', 'logging'];
  config.dbRestoration = {
    startTime: process.env.RESTORE_START_TIME || 1587352710000,
    endTime: process.env.RESTORE_END_TIME || 1587871110000,
    // endTime: process.env.RESTORE_TO_TIME || Number.MAX_SAFE_INTEGER,
  };
  config.dbRestoration.bucketName = 'mutationrecord';
  config.dbRestoration.numberOfObjectsPerBatch = 10;
};

function createRestorationInput(mutation) {
  const newArg = {
    ...mutation.record.args,
    user: mutation.record.args.user ? {
      ...mutation.record.args.user,
      id: mutation.record.result.data && mutation.record.result.data.id
        ? mutation.record.result.data.id
        : undefined,
    } : undefined,
    message: mutation.record.args.message ? {
      ...mutation.record.args.message,
      id: mutation.record.result.attributes && mutation.record.result.attributes.id ? mutation.record.result.attributes.id : undefined,
    } : undefined,
  };
  return newArg;
}

const doRestoration = () => {
  setupConfig();

  bootstrapper().then(async (container) => {
    const context = {
      container,
    };

    const { bucketName, startTime, endTime } = config.dbRestoration;

    const startTimeFormat = moment(startTime).format('YYYY-MM-DD-HH');
    const endTimeFormat = moment(endTime).format('YYYY-MM-DD-HH');

    const prefixList = getDateOnDuration(startTime, endTime);

    for (let i = 0; i <= prefixList.length - 1; i++) {

        const objectListOnPrefix = await getObjectList(prefixList[i], context);

        let objectDataOnPrefix = await Promise.all(
          objectListOnPrefix.map(async obj => {
            const objectData = await getObjects(bucketName, obj.name, context);
            return parseObject(objectData, config);
          })
        );

        objectDataOnPrefix = flatten(objectDataOnPrefix).sort((currentObject, nextObject) => (currentObject.record.timestamp > nextObject.record.timestamp) ? 1 : -1);

        for (const mutation of objectDataOnPrefix) {
          const restorationInput = createRestorationInput(mutation);

          if( resolvers.Mutation[mutation.record.fieldName].resolve) {
            const result = await resolvers.Mutation[mutation.record.fieldName].resolve({}, restorationInput, {
              ...context,
              req: mutation.record.req,
            });
          }

          if(! resolvers.Mutation[mutation.record.fieldName].resolve) {
            const result = await resolvers.Mutation[mutation.record.fieldName]({}, restorationInput, {
              ...context,
              req: mutation.record.req,
            });
          }
        }
    }

  }).catch((e) => console.log(e));
};

doRestoration();
