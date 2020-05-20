const { MongoClient } = require('mongodb');

module.exports = (config) => new Promise((resolve, reject) => {
  const baseConf = { native_parser: true, useUnifiedTopology: true };
  const mongoConf = process.env.NODE_ENV === 'development' ? baseConf : {
    ...baseConf, auth: {
      user: 'foobar',
      password: 'foobarPassword',
    },
    readPreference: 'secondaryPreferred',
    replicaSet: 'mongo-replica-set',
  };

  console.log(mongoConf);
  MongoClient.connect(
    config.mongodb.url,
    mongoConf,
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
