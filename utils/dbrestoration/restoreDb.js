const bootstrapper = require('./bootstrapper.tmp');
const mutationRecordLoad = require('./mutationRecordLoader');
const config = require('../../config');
const path = require('path');
const resolvers = require('../../modules/resolver');

global.APP_ROOT = path.resolve(__dirname);

const setupConfig = () => {
  config.middlewares = ['validation', 'logging'];
  config.dbRestoration = {
    endTime: process.env.RESTORE_TO_TIME || Number.MAX_SAFE_INTEGER,
  };
  config.dbRestoration.restorationBucket = 'mutationrecord';
};

const doRestoration = () => {
  setupConfig();
  bootstrapper().then(async (context) => {
    let lastTime = 0;
    let fromObjectName = '';
    let endOfData = false;
    while (!endOfData) {
      const loadedData = await mutationRecordLoad(lastTime, fromObjectName, config, context);
      await loadedData.mutation.forEach( async (mutation) => {
        await resolvers.Mutation[mutation.message.fieldName].resolve({}, mutation.message.args, context);
      });
      fromObjectName = loadedData.lastObjectName;
      lastTime = loadedData.lastTime;
      if (loadedData.endOfData) {
        endOfData = true;
      }
    }
  }).catch((e) => console.log(e));
};
doRestoration();
