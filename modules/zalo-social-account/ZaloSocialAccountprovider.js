const { ObjectId } = require('mongodb');
const moment = require('moment');
const { ResourceNotFoundError, ResourceAlreadyExist } = require('../errors');
const ZaloSocialAccount = require('./ZaloSocialAccount');

class ZaloSocialAccountProvider {
  /**
   *
   * @param {Collection} zaloSocialAccount
   */
  constructor(zaloSocialAccount) {
    this.zaloSocialAccount = zaloSocialAccount;
  }

  /**
   *
   * @param {Object} zaloSocialAccount
   * @returns {Promise<zaloSocialAccount>}
   */
  async create(zaloSocialAccount) {
    const inserted = await this.zaloSocialAccount.insertOne({
      socialId: zaloSocialAccount.socialId,
      socialAccessToken: zaloSocialAccount.socialAccessToken,
      socialAccessTokenLastUpdated: zaloSocialAccount.socialAccessTokenLastUpdated,
      zaloCleverApp: zaloSocialAccount.zaloCleverApp,
      socialInfo: zaloSocialAccount.socialInfo,
    });

    return ZaloSocialAccountProvider.factory(inserted.ops[0]);

  }

  /**
   *
   * @param {Object} rawData
   * @returns {null|zaloSocialAccount}
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

    const zaloSocialAccount = new ZaloSocialAccount(data._id || data.id);
    zaloSocialAccount.socialId = data.socialId;
    zaloSocialAccount.socialAccessToken = data.socialAccessToken;
    zaloSocialAccount.socialAccessTokenLastUpdated = data.socialAccessTokenLastUpdated;
    zaloSocialAccount.zaloCleverApp = data.zaloCleverApp;
    zaloSocialAccount.socialInfo = data.socialInfo;
    return zaloSocialAccount;
  }
}

module.exports = ZaloSocialAccountProvider;
