const ServiceProvider = require('../ServiceProvider');
const Cron = require('./../services/cron');

class CronManageServiceProvider extends ServiceProvider {
  // eslint-disable-next-line class-methods-use-this
  register() {
  }

  boot() {
    const { container } = this;
    const scheduleNotificationSender = container.resolve('scheduleNotificationSender');
    const { cron: { zaloScheduleInterval } } = container.resolve('config');
    new Cron('send-schedule-message', zaloScheduleInterval, scheduleNotificationSender).start();
    // const cron = new Cron('* * * * * *', {start: () => console.log('job start')}).start();
  }
}

module.exports = CronManageServiceProvider;
