const path = require('path');
const bootstrapper = require('./bootstrapper.tmp');
const { getObjects, getObjectList, parseObject } = require('./mutationRecordLoader');
const config = require('../../config');
const resolvers = require('../../modules/resolver');

global.APP_ROOT = path.resolve(__dirname);
console.log(global.APP_ROOT);

const setupConfig = () => {
  config.mongodb.dbname = 'simple_db_backup';
  config.middlewares = ['validation', 'logging'];
  config.dbRestoration = {
    endTime: process.env.RESTORE_TO_TIME || Number.MAX_SAFE_INTEGER,
  };
  config.dbRestoration.restorationBucket = 'mutationrecord';
  config.dbRestoration.numberOfObjectsPerBatch = 10;
};

const doRestoration = () => {
  setupConfig();
  bootstrapper().then(async (container) => {
    const context = {
      container,
    };
    let startAfterObject = '';
    let endOfData = false;
    const bucketName = config.dbRestoration.restorationBucket;
    while (!endOfData) {
      const objectLists = await getObjectList(startAfterObject, config, context);
      if (objectLists.length === 0) {
        endOfData = true;
      } else {
        const getObjectMutations = async () => Promise.all(objectLists
          .map(async (obj) => {
            const objectData = await getObjects(bucketName, obj.name, context);
            return parseObject(objectData, config);
          }));
        const objMutations = await getObjectMutations().then((objectMutations) => objectMutations.reduce((last, current) => last.concat(current)));
        console.log(objMutations);
        for (const mutation of objMutations) {
          console.log(mutation);
          if (resolvers.Mutation[mutation.record.fieldName].resolve) {
            const result = await resolvers.Mutation[mutation.record.fieldName].resolve({}, {
              ...mutation.record.args,
              ...mutation.result.data,
            }, {
              ...context,
              req: mutation.record.req,
            });
            console.log(result);
          } else {
            const result = await resolvers.Mutation[mutation.record.fieldName]({},  {
              ...mutation.record.args,
              ...mutation.result.data,
            }, {
              ...context,
              req: mutation.record.req,
            });
            console.log(result);
          }
        }
        startAfterObject = objectLists[objectLists.length - 1].name;
      }
    }
  }).catch((e) => console.log(e));
};

doRestoration();
