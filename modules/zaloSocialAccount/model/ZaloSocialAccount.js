const { ObjectId, Schema } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const userStates = [
  { id: 1, state: 'NEED_PROVIDE_PHONE_NUMBER' },
  { id: 2, state: 'PHONE_NUMBER_PROVIDED' },
];

const followingSchema = new Schema({
  appId: String,
  oaId: String,
  zaloIdByApp: String,
  zaloIdByOA: String,
  cleverOAId: String,
  state: { type: String, default: 'NEED_PROVIDE_PHONE_NUMBER' },
});
const zaloOASchema = new Schema({
  id: ObjectId,
  birthday: String,
  gender: String,
  name: String,
  avatar: String,
  createdAt: Date,
  lastModified: Date,
  phoneNumber: { type: String, unique: true },
  followings: [followingSchema],
});

zaloOASchema.plugin(mongoosePaginate);

exports = {
  userStates,
};
module.exports = zaloOASchema;
