const { MongoClient } = require('mongodb');

module.exports = (config) => new Promise((resolve, reject) => {
  MongoClient.connect(
    config.mongodb.url,
    {
      native_parser: true,
      useUnifiedTopology: true,
    },
    (err, client) => {
      if (err) reject(err);
      resolve(client);
    },
  );
});
