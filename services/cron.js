const { CronJob } = require('cron');

module.exports = class Cron {
  constructor(name, interval, job) {
    this.name = name;
    this.interval = interval;
    this.job = job;
  }

  start() {
    const job = new CronJob(this.interval, () => { this.job.start(); });
    job.start();
  }
};
