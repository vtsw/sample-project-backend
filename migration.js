/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-unused-expressions */
const faker = require('faker');
const mongoDb = require('./services/mongodb');
const Bcrypt = require('./services/bcrypt');
const config = require('./config');

mongoDb({ mongodb: { url: 'mongodb://foobar:foobarPassword@mongodb:27017/simple_db' } }).then(async (client) => {
  const db = client.db('simple_db');
  const bcrypt = new Bcrypt(config);

  if (await db.collection('users').findOne({ email: 'johndoe@example.com' })) {
    client.close();
    return;
  }

  const user = {
    name: 'John Doe',
    email: 'johndoe@example.com',
    address: '7 DuyTan, Cau Giay, HaNoi',
    company: 'EVN',
    dob: '1990-01-01',
    avatar: faker.image.avatar(),
  };

  user.password = await bcrypt.hash('123');

  const insertedUser = await db.collection('users').insertOne(user);
  const messages = [
    {
      content: 'hello world!',
      userId: insertedUser.insertedId,
      createdAt: new Date().getTime(),
    },
    {
      content: 'foobar',
      userId: insertedUser.insertedId,
      createdAt: new Date().getTime(),
    },
    {
      content: 'yahooo',
      userId: insertedUser.insertedId,
      createdAt: new Date().getTime(),
    },
  ];
  await db.collection('messages').insertMany(messages);

  client.close();
}).catch((err) => {
  console.log(err);
  process.exit();
});
