const bootstrapper = require('./bootstrapper.tmp');
const { getObjects, getObjectList, parseObject } = require('./mutationRecordLoader');
const config = require('../../config');
const resolvers = require('../../modules/resolver');

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

  bootstrapper().then(async (container) => {
    const context = {
      container,
    };
    let startAfterObject = '', endOfData = false;
    const bucketName = config.dbRestoration.restorationBucket;

    while (! endOfData) {
      const objectLists = await getObjectList(startAfterObject, config, context);
      const objectListlength = objectLists.length;

      if (objectListlength === 0) {
        endOfData = true;
      } 
      
      if(objectListlength !== 0) {

        const objectMutations = await Promise.all(
          objectLists.map(async obj => {
            const objectData = await getObjects(bucketName, obj.name, context);
            return parseObject(objectData, config);
          })
        );

        const objMutations = objectMutations.reduce((last, current) => last.concat(current));

        for (const mutation of objMutations) {
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

        startAfterObject = objectLists[objectLists.length - 1].name;

        console.log(startAfterObject);
      }
    }
  }).catch((e) => console.log(e));
};

doRestoration();
