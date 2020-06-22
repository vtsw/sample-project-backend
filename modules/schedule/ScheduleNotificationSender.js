const moment = require('moment');

class ScheduleNotificationSender {
  constructor(zaloMessageSender, scheduleMessagesProvider, zaloOAProvider, zaloSAProvider) {
    this.zaloMessageSender = zaloMessageSender;
    this.scheduleMessagesProvider = scheduleMessagesProvider;
    this.zaloOAProvider = zaloOAProvider;
    this.zaloSAProvider = zaloSAProvider;
  }

  async sendScheduleNotification() {
    const now = moment().unix(); const nextDay = moment().add(8, 'hours').unix();
    const schedules = await this.scheduleMessagesProvider.find({ time: { $gte: now, $lte: nextDay } });

    schedules.map(async (schedule) => {
      const {
        _id: scheduleId, from: { id: senderId }, to: { id: recipientId }, message: { type: messageTye, content: messageContent },
      } = schedule;

      const [sender, recipient] = await Promise.all([
        this.zaloOAProvider.findById(senderId),
        this.zaloSAProvider.findById(recipientId),
      ]);

      let zaloResponse;
      if (messageTye === 'text') {
        zaloResponse = await this.zaloMessageSender.sendText({ text: messageContent }, recipient, sender);
      }

      if (messageTye === 'element') {
        zaloResponse = await this.zaloMessageSender.sendListElement(messageContent, recipient, sender);
      }

      const { message: zaloResponseStatus } = zaloResponse;

      if (zaloResponseStatus === 'Success') {
        await this.scheduleMessagesProvider.findByIdAndUpdate(scheduleId, { status: 'success' });
      }

      if (zaloResponseStatus !== 'Success') {
        const scheduleSendFailed = await this.scheduleMessagesProvider.findById(scheduleId);
        const { retryCount } = scheduleSendFailed;

        if (!retryCount) {
          await this.scheduleMessagesProvider.findByIdAndUpdate(scheduleId, { status: 'retry', retryCount: 1 });
        }

        if (retryCount < 3) {
          await this.scheduleMessagesProvider.findByIdAndUpdate(scheduleId, { status: 'retry', retryCount: retryCount + 1 });
        }

        if (retryCount >= 3) {
          await this.scheduleMessagesProvider.findByIdAndUpdate(scheduleId, { status: 'failed' });
        }
      }
    });
  }

  start() {
    return this.sendScheduleNotification();
  }
}

module.exports = ScheduleNotificationSender;
