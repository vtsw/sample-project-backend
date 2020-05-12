const { ObjectId } = require('mongodb');
const moment = require('moment');
const ReservationRequestHistory = require('./ReservationRequestHistory');

class ReservationRequestHistoryProvider {
  /**
   *
   * @param {Collection} reservationRequestHistory
   */
  constructor(reservationRequestHistory) {
    this.reservationRequestHistory = reservationRequestHistory;
  }

  findOne() {
    return this.reservationRequestHistory.findOne()
  }

  /**
 *
 * @param {Object} reservationRequestHistory
 * @returns {Promise<reservationRequestHistory>}
 */
  async create(reservationHistory) {
    const inserted = await this.reservationRequestHistory.insertOne(reservationHistory);
    return ReservationRequestHistoryProvider.factory(inserted.ops[0]);
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
    const reservationRequestHistory = new ReservationRequestHistory(data._id || data.id);
    reservationRequestHistory.source = data.source;
    reservationRequestHistory.recipientId = data.recipientId;
    reservationRequestHistory.senderId = data.senderId;
    reservationRequestHistory.payload = data.payload;
    reservationRequestHistory.timestamp = data.timestamp;

    return reservationRequestHistory;
  }
}

module.exports = ReservationRequestHistoryProvider;
