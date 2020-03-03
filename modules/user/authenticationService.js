const UserProvider = require('./userProvider');

class AuthenticationService {
  constructor(bcrypt, userRepository, jwt) {
    this.bcrypt = bcrypt;
    this.userRepository = userRepository;
    this.jwt = jwt;
  }


  async login(email, password) {
    const user = await this.userRepository.findByCredential(email);
    if (!user) {
      throw new Error('User or password is invalid.');
    }
    if (!this.bcrypt.compare(password, user.password)) {
      throw new Error('User or password is invalid.');
    }
    return this.jwt.encode(user.toJson());
  }

  async verify(token) {
    const payload = this.jwt.decode(token);
    if (!payload) {
      throw new Error('Authorization token is invalid.');
    }
    return UserProvider.factory(payload);
  }

  async register(user) {
    if (await this.userRepository.findByCredential(user.email)) {
      throw new Error('The email already exists.');
    }
    const newUser = { ...user };
    newUser.password = await this.bcrypt.hash(newUser.password, 10);
    return this.userRepository.create(newUser);
  }
}

module.exports = AuthenticationService;
