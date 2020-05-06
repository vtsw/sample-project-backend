const { asClass } = require('awilix');
const ServiceProvider = require('../../ServiceProvider');
const UserProvider = require('./UserProvider');
const Authenticator = require('./Authenticator');


class UserServiceProvider extends ServiceProvider {
  register() {
    this.container
      .register('userProvider',
        asClass(UserProvider)
          .inject((injectedContainer) => ({ users: injectedContainer.resolve('db').collection('users') })));
    this.container.register('authService', asClass(Authenticator).singleton());
  }
}

module.exports = UserServiceProvider;
