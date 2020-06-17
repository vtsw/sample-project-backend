const { asFunction } = require('awilix');
const ServiceProvider = require('../../ServiceProvider');
const ScheduleMessage = require('./models/ScheduleMessage');


class ScheduleServiceProvider extends ServiceProvider {
  register() {
    const { container } = this;
    container.register('scheduleMessageProvider', asFunction(() => container.resolve('db')
      .model('ScheduleMessage', ScheduleMessage, 'ScheduleMessages'))
      .singleton());
  }
}

module.exports = ScheduleServiceProvider;
