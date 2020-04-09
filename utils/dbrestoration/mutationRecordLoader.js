const getObject = (minioClient, bucketName, object) => new Promise((resolve, reject) => {
  const databuffer = [];
  const data = [];
  minioClient.getObject(bucketName, object.name, (error, dataStream) => {
    if (error) {
      console.log(error);
      reject(error);
    }
    dataStream.on('data', (chunk) => {
      databuffer.push(chunk);
    });
    dataStream.on('end', () => {
      data.push(...(Buffer.concat(databuffer).toString('utf8').split('\r\n')));
      resolve(data);
    });
    dataStream.on('error', (errorz) => {
      console.log(errorz);
      reject(errorz);
    });
  });
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
  console.log('bucketName', bucketName);
  const { endTime } = config.dbRestoration;
  const minioClient = context.minio;
  const mutationObjectsStream = minioClient.extensions.listObjectsV2WithMetadata(bucketName, '', false, fromObjectName);

  mutationObjectsStream.on('data', (object) => {
    const { metadata } = object;
    const createdTimestamp = Number(metadata['X-Amz-Meta-Createdate']);
    if (result.mutationObjects.length < 10) {
      if (fromTime <= createdTimestamp && createdTimestamp <= endTime) {
        result.mutationObjects.push(object);
        result.lastObjectName = object.name;
        getObject(minioClient, bucketName, object)
          .then((data) => {
            const mutations = data
              .map((line) => {
                if (line.length > 0) {
                  return JSON.parse(line);
                }
                return {};
              })
              .filter((obj) => !!obj.timestamp)
              .filter((mutation) => {
                console.log(mutation);
                const { timestamp } = mutation.message;
                if (!timestamp) return false;
                return fromTime <= timestamp && timestamp < endTime;
              });
            mutations.forEach((mutation) => { if (mutation.timestamp > result.lastTime) result.lastTime = mutation.timestamp; });
            result.mutation.push(...mutations);
            resolve(result);
          });
      }
    }
  });

  mutationObjectsStream.on('error', (error) => {
    console.log('error', error);
    result.endOfData = true;
    reject(error);
  });

  mutationObjectsStream.on('end', () => {
    // console.log(result);
  });
});

module.exports = loadData;
