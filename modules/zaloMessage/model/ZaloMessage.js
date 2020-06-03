const { ObjectId, Schema } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const zaloMessage = new Schema({
  id: ObjectId,
  zaloMessageId: { type: String, unique: true },
  from: {
    id: ObjectId,
    displayName: String,
    avatar: String,
    zaloId: String,
  },
  content: String,
  to: {
    id: ObjectId,
    displayName: String,
    avatar: String,
    zaloId: String,
  },
  timestamp: Date,
  attachments: Array,
  type: String,
});

zaloMessage.plugin(mongoosePaginate);

module.exports = zaloMessage;
