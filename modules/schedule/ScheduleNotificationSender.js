// const { ZaloApiError } = require('../errors');

class ScheduleNotificationSender {
  constructor(zaloMessageSender, scheduleMessageProvider) {
    this.zaloMessageSender = zaloMessageSender;
    this.scheduleMessageProvider = scheduleMessageProvider;
  }

  static run() {
    console.log('12321');
  }
}

module.exports = ScheduleNotificationSender;
