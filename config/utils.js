const getHost = (config) => {
  const { app } = config;
  if (app.port !== 80) {
    return `${app.host}:${app.port}`;
  }
  return app.host;
};

module.exports = {
  getHost,
};
