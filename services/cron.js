const { CronJob } = require('cron');

module.exports = class Cron {
  constructor(name, step, job) {
    this.name = name;
    this.step = step;
    this.job = job;
  }

  start() {
    const job = new CronJob(this.step, () => { this.job.start(); });
    job.start();
  }
};
