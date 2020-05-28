module.exports = {
  async up(db, client) {
    const simpleDb = client.db('simple_db');
    await simpleDb.addUser('foobar', 'foobarPassword',
      {
        roles: [
          { role: 'readWrite', db: 'simple_db' },
        ],
      });
    await simpleDb.createCollection('zaloOA');
    await simpleDb.createCollection('zaloInterestedUser');
  },

  async down(db, client) {
    const simpleDb = client.db('simple_db');
    await simpleDb.removeUser('foobar');
    await simpleDb.dropDatabase();
  },
};
