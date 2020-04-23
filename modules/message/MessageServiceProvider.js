const { asClass } = require('awilix');
const MessageProvider = require('./MessageProvider');

const ServiceProvider = require('../../ServiceProvider');

class MessageServiceProvider extends ServiceProvider {
  register() {
    this.container.register({
      messageProvider: asClass(MessageProvider)
        .inject((injectedContainer) => ({ messages: injectedContainer.resolve('db').collection('messages') })).singleton(),
    });
  }
}

module.exports = MessageServiceProvider;
