const { MongoClient } = require('mongodb');

module.exports = (config) => new Promise((resolve, reject) => {
  MongoClient.connect(
    config.mongodb.url,
    {
      native_parser: true,
      useUnifiedTopology: true,
      auth: {
        user: 'foobar',
        password: 'foobarPassword',
      },
      readPreference: 'secondaryPreferred',
      replicaSet: 'mongo-replica-set',
    },
    (err, client) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        client.db('simple_db');
        resolve(client);
      }
    },
  );
});
