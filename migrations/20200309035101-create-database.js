module.exports = {
  async up(db, client) {
    const simpleDb = client.db('simple_db');
    await simpleDb.addUser('zalo', '1',
      {
        roles: [
          { role: 'readWrite', db: 'zalo' },
        ],
      });
  },

  async down(db, client) {
    await client.db('simple_db').dropDatabase();
  },
};
