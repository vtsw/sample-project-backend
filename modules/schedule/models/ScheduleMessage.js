const { ObjectId, Schema } = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const mongoosePaginate = require('mongoose-paginate-v2');

const ScheduledMessage = new Schema({
  id: ObjectId,
  from: {
    id: ObjectId,
    name: String,
    avatar: String,
  },
  to: {
    id: ObjectId,
    name: String,
    avatar: String,
  },
  createdAt: Date,
  time: Date,
  message: {
    type: String,
    content: {},
  },
});

ScheduledMessage.plugin(mongooseDelete, { overrideMethods: true, deletedAt: true, use$neOperator: false });
ScheduledMessage.plugin(mongoosePaginate);


module.exports = ScheduledMessage;
