const { asClass, asFunction } = require('awilix');
const ServiceProvider = require('../../ServiceProvider');
const ScheduleMessage = require('./models/ScheduleMessage');
const ScheduleNotificationSender = require('./ScheduleNotificationSender');

class ScheduleServiceProvider extends ServiceProvider {
  register() {
    const { container } = this;
    container.register('scheduleMessageProvider', asFunction(() => container.resolve('db')
      .model('ScheduleMessage', ScheduleMessage, 'ScheduleMessages'))
      .singleton());
    container.register('scheduleNotificationSender', asClass(ScheduleNotificationSender).inject((injectedContainer) => ({
      zaloMessageSender: injectedContainer.resolve('zaloMessageSender'),
      scheduleMessageProvider: injectedContainer.resolve('scheduleMessageProvider'),
    })).singleton());
  }
}

module.exports = ScheduleServiceProvider;
