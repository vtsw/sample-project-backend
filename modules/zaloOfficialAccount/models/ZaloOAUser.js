const { ObjectId, Schema } = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const mongoosePaginate = require('mongoose-paginate-v2');
const zaloOACredential = require('./ZaloOACredential');


const zaloOASchema = new Schema({
  id: ObjectId,
  description: String,
  name: String,
  avatar: String,
  cover: String,
  oaId: { type: String, unique: false },
  createdAt: Date,
  lastModified: Date,
  credential: zaloOACredential,
});

zaloOASchema.plugin(mongooseDelete, { overrideMethods: true, deletedAt: true, use$neOperator: false });
zaloOASchema.plugin(mongoosePaginate);


module.exports = zaloOASchema;
