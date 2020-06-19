const { ObjectId, Schema } = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const mongoosePaginate = require('mongoose-paginate-v2');

const ScheduleMessage = new Schema({
  id: ObjectId,
  from: {
    id: ObjectId,
    name: String,
    avatar: String,
  },
  status: String,
  retryCount: Number,
  to: {
    id: ObjectId,
    name: String,
    avatar: String,
  },
  message: {
    type: { type: String },
    content: {},
  },
  createdAt: Date,
  time: Number,
});

ScheduleMessage.plugin(mongooseDelete, { overrideMethods: true, deletedAt: true, use$neOperator: false });
ScheduleMessage.plugin(mongoosePaginate);


module.exports = ScheduleMessage;
