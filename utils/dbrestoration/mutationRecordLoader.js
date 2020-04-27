
const config = require('../../config');
const inTime = (createdTimestamp, endTime) => createdTimestamp <= endTime;

const getObjects = (bucketName, objectName, context) => new Promise((resolve, reject) => {
  const minioClient = context.container.resolve('minio');
  const databuffer = [];

  minioClient.getObject(bucketName, objectName, (error, dataStream) => {
    if (error) {
      console.log(error);
      reject(error);
    }

    dataStream.on('data', (chunk) => {
      databuffer.push(chunk);
    });

    dataStream.on('error', (err) => {
      console.log(err);
      reject(err);
    });
    
    dataStream.on('end', () => {
      const data = Buffer.concat(databuffer).toString('utf8').split('\r\n');
      resolve(data);
    });
  });
});

const parseObject = (objectData, config) => {
  if (objectData.length !== 0) {
    const result = objectData
      .map((mutation) => {
        try {
          const parsed = JSON.parse(mutation);
          return parsed;
        } catch (e) {
          return {};
        }
      })
      .filter((mutation) => !!mutation.record)
      .filter((mutation) => inTime(mutation.record.timestamp, config.dbRestoration.endTime))
      .sort((mutationA, mutationB) => mutationA.record.timestamp - mutationB.record.timestamp);
    // const lastTime = refinedMutation.reduce((last, mutation) => (mutation.record.timestamp > last ? mutation.record.timestamp : last));
    return result;
  }
  const result = [];
  return result;
};

const getObjectList = (prefix, context) => new Promise((resolve, reject) => {
  const mutationObjects = [];
  const { bucketName }  = config.dbRestoration;
  const minioClient = context.container.resolve('minio');
  const mutationObjectsStream = minioClient.listObjects(bucketName, prefix);

  mutationObjectsStream.on('data', (miniObject) => {
    mutationObjects.push(miniObject)
  });

  mutationObjectsStream.on('error', (error) => {
    console.log(`${error}`);
    reject(err);
  });

  mutationObjectsStream.on('close', () => {
    resolve(mutationObjects);
  });

  mutationObjectsStream.on('end', () => {
    resolve(mutationObjects);
  });
});

module.exports = {
  getObjectList, getObjects, parseObject,
};
