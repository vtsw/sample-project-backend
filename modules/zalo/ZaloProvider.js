const { ObjectId } = require('mongodb');
const moment = require('moment');

const { ResourceNotFoundError } = require('../errors');

class ZaloProvider {
  constructor(db) {
    this.db = db;
    this.zalos = db.collection('zalo');
    this.zaloCleverApps = db.collection('zaloCleverApps');
    this.zaloOAs = db.collection('zaloOA');
  }
  // sendMessageFromOA()

  saveOrUpdateOAToken(oaId, token) {
    const oa = this.zaloOAs.findById({ oaId });
    if (oa) {
      const updatedOA = {
        ...oa,
        oaAccessToken: token,
        oaAccessTokenLastUpdatedTime: moment().format(),
      };
      this.zaloOAs.updateOne({ _id: ObjectId(oa._id) }, { $set: { ...updatedOA } });
    } else {
      throw new ResourceNotFoundError('zaloOA', `id: ${oaId}`);
    }
  }

  findAllZaloOas() {
    return this.zaloOAs.find().toArray();
  }
}

module.exports = ZaloProvider;
