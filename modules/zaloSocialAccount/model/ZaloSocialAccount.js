const { ObjectId, Schema } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const followingSchema = require('./ZaloSocialAccountFollowing');

const zaloOASchema = new Schema({
  id: ObjectId,
  birthday: String,
  gender: String,
  name: String,
  avatar: String,
  avatars: Object,
  createdAt: Date,
  lastModified: Date,
  phoneNumber: { type: String, unique: true },
  followings: [followingSchema],
  address: Object,
});

zaloOASchema.plugin(mongoosePaginate);

module.exports = zaloOASchema;
