const path = require('path');
const bootstrapper = require('./bootstrapper.tmp');
const { getObjects, getObjectList, parseObject } = require('./mutationRecordLoader');
const config = require('../../config');
const resolvers = require('../../modules/resolver');

global.APP_ROOT = path.resolve(__dirname);
console.log(global.APP_ROOT);

const setupConfig = () => {
  config.middlewares = ['validation', 'logging'];
  config.dbRestoration = {
    endTime: process.env.RESTORE_TO_TIME || Number.MAX_SAFE_INTEGER,
  };
  config.dbRestoration.restorationBucket = 'mutationrecord';
  config.dbRestoration.numberOfObjectsPerBatch = 10;
};

const doRestoration = () => {
  setupConfig();
  bootstrapper().then(async (context) => {
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
        const objMutations = await getObjectMutations().then((objectMutations) => {
          return objectMutations.reduce((last, current) => {
            return last.concat(current);
          });
        });
        console.log(objMutations);
        await objMutations.forEach(async (mutation) => {
          console.log(mutation);
          await resolvers.Mutation[mutation.message.fieldName].resolve({}, mutation.message.args, context);
        });
        startAfterObject = objectLists[objectLists.length - 1].name;
      }
    }
  }).catch((e) => console.log(e));
};

doRestoration();
