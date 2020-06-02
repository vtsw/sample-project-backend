const { Schema } = require('mongoose');

module.exports = new Schema({
  accessToken: String,
  appId: String,
  appSecretKey: String,
  oaSecretKey: String,
});
