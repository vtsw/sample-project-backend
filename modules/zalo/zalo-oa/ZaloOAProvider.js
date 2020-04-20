const { ObjectId } = require('mongodb');
const moment = require('moment');
const { ResourceNotFoundError, ResourceAlreadyExist } = require('../../errors');
const ZaloOA = require('./ZaloOA');

class ZaloOAProvider {
  /**
   *
   * @param {Collection} zaloOA
   */
  constructor(zaloOA) {
    this.zaloOA = zaloOA;
  }

  /**
   *
   * @param {Object} zaloOA
   * @returns {Promise<zaloOA>}
   */
  async create(zaloOA) {
    const inserted = await this.zaloOA.insertOne({
      oaId : zaloOA.oaId,
      appId : zaloOA.appId,
      oaAccessToken : zaloOA.oaAccessToken,
      oaAccessTokenLastUpdatedTime : zaloOA.oaAccessTokenLastUpdatedTime,
      oaInfo : zaloOA.oaInfo
    });

    return ZaloOAProvider.factory(inserted.ops[0]);
  }

  /**
   *
   * @param {Object} rawData
   * @returns {null|zaloOA}
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

    const zaloOA = new ZaloOA(data._id || data.id);
    zaloOA.oaId = data.oaId;
    zaloOA.appId = data.appId;
    zaloOA.oaAccessToken = data.oaAccessToken;
    zaloOA.oaAccessTokenLastUpdatedTime = data.oaAccessTokenLastUpdatedTime;
    zaloOA.oaInfo = data.oaInfo;
    return zaloOA;
  }
}

module.exports = ZaloOAProvider;
