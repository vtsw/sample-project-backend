const { ObjectId } = require('mongodb');
const moment = require('moment');
const { ResourceNotFoundError, ResourceAlreadyExist } = require('../../errors');
const ZaloCleverApp = require('./ZaloCleverApp');

class ZaloCleverAppProvider {
  /**
   *
   * @param {Collection} zaloCleverApp
   */
  constructor(zaloCleverApp) {
    this.zaloCleverApp = zaloCleverApp;
  }

  /**
   *
   * @param {Object} zaloCleverApp
   * @returns {Promise<zaloCleverApp>}
   */
  async create(zaloCleverApp) {

    const inserted = await this.zaloCleverApp.insertOne({
      appId: zaloCleverApp.appId,
      appSecret: zaloCleverApp.appSecret,
      appCallbackUrl: zaloCleverApp.appCallbackUrl
    });

    return ZaloCleverAppProvider.factory(inserted.ops[0]);
  }

  /**
   *
   * @param {Object} rawData
   * @returns {null|zaloCleverApp}
   */
  static factory(rawData) {
    if (!rawData) {
      return null;
    }
    // convert all objectId type attribute to string type to decouple from mongodb layer
    const data = {};
    Object.keys(rawData).forEach((key) => {
      if (rawData[key] instanceof ObjectId) {
        data[key] = rawData[key].toString();
      } else {
        data[key] = rawData[key];
      }
    });

    const zaloCleverApp = new ZaloCleverApp(data._id || data.id);
    zaloCleverApp.appId = data.appId;
    zaloCleverApp.appSecret = data.appSecret;
    zaloCleverApp.appCallbackUrl = data.appCallbackUrl;
    return zaloCleverApp;
  }
}

module.exports = ZaloCleverAppProvider;
