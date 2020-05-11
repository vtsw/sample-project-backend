const { ObjectId } = require('mongodb');
const moment = require('moment');
const ZaloReservation = require('./ZaloReservation');

class ZaloReservationProvider {
  /**
   *
   * @param {Collection} ZaloReservation
   */
  constructor(zaloReservation) {
    this.zaloReservation = zaloReservation;
  }
  /**
   *
   * @param {Object} zaloReservation
   * @returns {Promise<ZaloInterestedUser>}
   */
  async create(zaloReservation) {
    console.log('hello world', zaloReservation);
    // const inserted = await this.zaloReservation.insertOne({
    //   type: zaloReservation.type,
    //   content: zaloReservation.content,
    // });

    // return ZaloReservationProvider.factory(inserted.ops[0]);
  }

  /**
   *
   * @param {Object} rawData
   * @returns {null|ZaloInterestedUser}
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
    const zaloReservation = new ZaloReservation(data._id || data.id);
    zaloReservation.type = data.type;
    zaloReservation.content = data.content;
    return zaloReservation;
  }
}

module.exports = ZaloReservationProvider;
