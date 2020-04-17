const inTime = (fromTime, createdTimestamp, endTime) => fromTime <= createdTimestamp && createdTimestamp <= endTime;

const getObjects = (minioClient, bucketName, result, remain, fromTime, config) => new Promise((resolve, reject) => {
  if (remain.length === 0) {
    if (result.mutation.length !== 0) {
      const refinedMutation = result.mutation
        .map((mutation) => {
          try {
            const parsed = JSON.parse(mutation);
            return parsed;
          } catch (e) {
            console.log('errorLine:');
            console.log(mutation);
            return {};
          }
        })
        .filter((mutation) => !!mutation.message)
        .filter((mutation) => inTime(fromTime, mutation.message.timestamp, config.dbRestoration.endTime))
        .sort((mutationA, mutationB) => mutationA.message.timestamp - mutationB.message.timestamp);
      const lastTime = refinedMutation.reduce((last, mutation) => (mutation.message.timestamp > last ? mutation.message.timestamp : last));
      const refinedResult = {
        ...result,
        mutation: refinedMutation,
        lastTime,
        endOfData: refinedMutation.length === 0,
        done: true,
      };
      resolve(refinedResult);
    } else {
      const emptyResult = {
        ...result,
        endOfData: true,
        done: true,
      };
      resolve(emptyResult);
    }
  } else {
    const databuffer = [];
    const object = remain[0];
    minioClient.getObject(bucketName, object.name, (error, dataStream) => {
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
        result.mutation.push(...data);
        resolve(result);
      });
    });
  }
}).then((resultz) => {
  if (resultz.done) return new Promise((resolve, reject) => resolve(resultz));
  return getObjects(minioClient, bucketName, resultz, remain.slice(1, remain.length), fromTime, config);
});

const loadData = (fromTime, fromObjectName, config, context) => new Promise((resolve, reject) => {
  const result = {
    mutation: [],
    mutationObjects: [],
    lastObjectName: undefined,
    lastTime: fromTime,
    endOfData: false,
  };
  const bucketName = config.dbRestoration.restorationBucket;
  const { endTime } = config.dbRestoration;
  const minioClient = context.resolve('minio');
  const mutationObjectsStream = minioClient.extensions.listObjectsV2WithMetadata(bucketName, '', false, fromObjectName);

  mutationObjectsStream.on('data', (object) => {
    const { metadata } = object;
    const createdTimestamp = Number(metadata['X-Amz-Meta-Createdate']);

    if (inTime(fromTime, createdTimestamp, endTime)) {
      result.mutationObjects.push(object);
    }
  });

  mutationObjectsStream.on('error', (error) => {
    console.log('error', error);
    result.endOfData = true;
    reject(error);
  });

  mutationObjectsStream.on('end', () => {
    resolve(result);
  });
}).then((result) => getObjects(context.minio, config.dbRestoration.restorationBucket, result, result.mutationObjects, fromTime, config));

module.exports = loadData;
