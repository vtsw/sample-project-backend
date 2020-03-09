const config = require('../config');
const Bcrypt = require('../services/bcrypt');

module.exports = {
  async up(db, client) {
    const simpleDb = client.db('simple_db');
    const bcrypt = new Bcrypt(config);
    const user = {
      name: 'John Doe',
      email: 'johndoe@example.com',
    };
    const users = [
      {
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: await bcrypt.hash('123'),
      },
      {
        name: 'Sam',
        email: 'sam@example.com',
        password: await bcrypt.hash('123'),
      },
      {
        name: 'Steve',
        email: 'steve@example.com',
        password: await bcrypt.hash('123'),
      },
    ];
    user.password = await bcrypt.hash('123');
    await simpleDb.collection('users').insertMany(users);
  },

  async down(db, client) {
    const simpleDb = client.db('simple_db');
    await simpleDb.collection('users').remove();
  },
};
