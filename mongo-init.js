const mongoDb = require('./services/mongodb');

mongoDb({ mongodb: { url: 'mongodb://root:root@mongodb:27017' } }).then(async (client) => {
  const adminDb = client.db('admin').admin();
  const { databases } = await adminDb.listDatabases();
  if (databases.find((db) => db.name === 'simple_db')) {
    console.log('database simple_db already exist.');
    client.close();
    return;
  }

  const db = client.db('simple_db');
  db.createCollection('users');
  db.createCollection('messages');
  await db.addUser('foobar', 'foobarPassword',
    {
      roles: [
        { role: 'readWrite', db: 'simple_db' },
      ],
    });
  client.close();
});
