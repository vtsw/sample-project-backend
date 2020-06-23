const { asClass, asFunction } = require('awilix');
const ServiceProvider = require('../../ServiceProvider');
const ScheduleMessage = require('./models/ScheduleMessage');
const ScheduleNotificationSender = require('./ScheduleNotificationSender');

class ScheduleServiceProvider extends ServiceProvider {
  register() {
    const { container } = this;
    container.register('scheduleMessagesProvider', asFunction(() => container.resolve('db')
      .model('ScheduleMessage', ScheduleMessage, 'scheduleMessages'))
      .singleton());
    container.register('scheduleNotificationSender', asClass(ScheduleNotificationSender).inject((injectedContainer) => ({
      zaloMessageSender: injectedContainer.resolve('zaloMessageSender'),
      scheduleMessagesProvider: injectedContainer.resolve('scheduleMessagesProvider'),
      zaloOAProvider: injectedContainer.resolve('zaloOAProvider'),
      zaloSAProvider: injectedContainer.resolve('zaloSAProvider'),
    })).singleton());
  }
}

module.exports = ScheduleServiceProvider;
