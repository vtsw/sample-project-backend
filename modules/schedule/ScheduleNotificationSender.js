// const { ZaloApiError } = require('../errors');
const { ObjectId } = require('mongoose');
class ScheduleNotificationSender {
  constructor(zaloMessageSender, scheduleMessagesProvider) {
    this.zaloMessageSender = zaloMessageSender;
    this.scheduleMessagesProvider = scheduleMessagesProvider;
  }

  async sendScheduleNotification() {
    try {
      const schedule = await this.scheduleMessagesProvider.create({
        'from': {
          'id': '5e68995fb6d0bc05829b6e79',
          'name': 'steve',
          'avatar': 'https://172.76.10.161:4000/api/download/images/abb90930-95c5-4579-b4d6-8408261dbe5cbc0056e87208a3681730965748c887fc.jpg',
        },
        'to': {
          'id': '5ecf35299468514281e3a74e',
          'name': 'Thanh Son',
          'avatar': 'http://s120.avatar.talk.zdn.vn/4/2/f/f/3/120/c00af8fe0a757389d5be39413a0606a3.jpg'
        },
        message: {
          'type': 'text',
          content: 'Ban nho di kham bac sy nhe',
        },
        time: 1592382757,
      });

      // const schedule = await this.scheduleMessagesProvider.find({});

      return schedule;
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = ScheduleNotificationSender;
