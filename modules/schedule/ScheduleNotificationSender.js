const moment = require('moment');

class ScheduleNotificationSender {
  constructor(zaloMessageSender, scheduleMessagesProvider, zaloOAProvider, zaloSAProvider) {
    this.zaloMessageSender = zaloMessageSender;
    this.scheduleMessagesProvider = scheduleMessagesProvider;
    this.zaloOAProvider = zaloOAProvider;
    this.zaloSAProvider = zaloSAProvider;
  }

  async sendScheduleNotification() {
    const now = moment().unix(); const nextDay = moment().add(1, 'days').unix();

    const schedule = await this.scheduleMessagesProvider.find({ time: { $gte: now, $lte: nextDay } });

    const [sampleSchedule] = schedule;

    const { from: { id: senderId }, to: { id: recipientId }, message: { content: messageContent } } = sampleSchedule;

    const [sender, recipient] = await Promise.all([
      this.zaloOAProvider.findById(senderId),
      this.zaloSAProvider.findById(recipientId),
    ]);

    await this.zaloMessageSender.sendText({ text: messageContent }, recipient, sender);

    return schedule;
  }
}

module.exports = ScheduleNotificationSender;
