const officialAccount = require('./officialAccount');
const socialAccount = require('./socialAccount');

module.exports = (container) => ({
  officialAccount: officialAccount(container),
  socialAccount: socialAccount(container),
});
