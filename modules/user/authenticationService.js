const UserProvider = require('./userProvider');
const { AuthenticationError } = require('../errors');

class AuthenticationService {
  constructor(bcrypt, userProvider, jwt) {
    this.bcrypt = bcrypt;
    this.userProvider = userProvider;
    this.jwt = jwt;
  }


  async login(email, password) {
    const user = await this.userProvider.findByEmail(email);
    if (!user) {
      throw new AuthenticationError('User or password is invalid.');
    }
    if (!this.bcrypt.compare(password, user.password)) {
      throw new AuthenticationError('User or password is invalid.');
    }
    return {
      token: this.jwt.encode(user.toJson()),
    };
  }

  async verify(token) {
    const payload = this.jwt.decode(token);
    if (!payload) {
      throw new AuthenticationError('Invalid token');
    }
    return UserProvider.factory(payload);
  }

  async register(user) {
    if (await this.userProvider.findByEmail(user.email)) {
      throw new AuthenticationError('The email already exists.');
    }
    const newUser = { ...user };
    newUser.password = await this.bcrypt.hash(newUser.password, 10);
    return this.userProvider.create(newUser);
  }
}

module.exports = AuthenticationService;
