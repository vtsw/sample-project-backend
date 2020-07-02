const { asFunction } = require('awilix');
const ServiceProvider = require('../../ServiceProvider');
const zaloMessage = require("./model/ZaloMessage");

class ZaloMessageServiceProvider extends ServiceProvider {
  register() {
    const { container } = this;
    container.register('zaloMessageProvider', asFunction(() => container.resolve('db')
      .model('ZaloMessage', zaloMessage, 'zaloMessages'))
      .singleton());
  }
}

module.exports = ZaloMessageServiceProvider;
