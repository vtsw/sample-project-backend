module.exports = {
  async up(db, client) {
    const simpleDb = client.db('simple_db');
    await simpleDb.addUser('simple', 'simplePassword',
      {
        roles: [
          { role: 'readWrite', db: 'simple_db' },
        ],
      });
    await simpleDb.createCollection('users');
    await simpleDb.createCollection('messages');
  },

  async down(db, client) {
    const simpleDb = client.db('simple_db');
    await simpleDb.removeUser('foobar');
    await simpleDb.dropDatabase();
  },
};
