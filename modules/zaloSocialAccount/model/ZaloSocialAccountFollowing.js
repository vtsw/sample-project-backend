const { Schema, Types: { ObjectId } } = require('mongoose');

const userStates = [
  { id: 1, state: 'NEED_PROVIDE_PHONE_NUMBER' },
  { id: 2, state: 'PHONE_NUMBER_PROVIDED' },
];

const followingSchema = new Schema({
  appId: String,
  oaId: String,
  zaloIdByApp: String,
  zaloIdByOA: String,
  cleverOAId: ObjectId,
  state: { type: String, default: 'NEED_PROVIDE_PHONE_NUMBER' },
});

exports = {
  userStates,
};
module.exports = followingSchema;
