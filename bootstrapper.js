const { asValue } = require('awilix');
const container = require('./container');
const config = require('./config');

/**
 * ensures all essential modules are already available before lunching app.
 * @returns {Promise<container>}
 */
module.exports = async () => {
  const { serviceProviders } = config;
  container.register({
    config: asValue(config),
  });
  const services = serviceProviders.map((Service) => new Service(container));
  services.forEach((service) => {
    service.register();
  });

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < services.length; i++) {
    if (typeof services[i].boot === 'function') {
      // eslint-disable-next-line no-await-in-loop
      await services[i].boot();
    }
  }

  return container;
};
