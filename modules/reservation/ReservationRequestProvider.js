const { ObjectId } = require('mongodb');
const moment = require('moment');
const ReservationRequest = require('./ReservationRequest');

class ReservationRequestProvider {
  /**
   *
   * @param {Collection} reservationRequest
   */
  constructor(reservationRequest) {
    this.reservationRequest = reservationRequest;
  }

  findOne() {
    return this.reservationRequest.findOne()
  }

  /**
 *
 * @param {Object} reservationRequest
 * @returns {Promise<reservationRequest>}
 */
  async create(reservationRequest) {
    // const reservationRequestInsert            = new ReservationRequest();
    // reservationRequestInsert.source           = reservationRequest.source;
    // reservationRequestInsert.cleverSenderId   = reservationRequest.cleverSenderId;
    // reservationRequestInsert.zaloRecipientId  = reservationRequest.zaloRecipientId;
    // reservationRequestInsert.zaloMessageId    = reservationRequest.zaloMessageId;
    // reservationRequestInsert.zaloSenderId     = reservationRequest.zaloSenderId;
    // reservationRequestInsert.corId            = reservationRequest.corId;
    // reservationRequestInsert.timestamp        = moment().valueOf();
    // reservationRequestInsert.payload          = reservationRequest.payload;

    const inserted = await this.reservationRequest.insertOne(reservationRequest);
    return ReservationRequestProvider.factory(inserted.ops[0]);
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
    const reservationRequest = new ReservationRequest(data._id || data.id);
    reservationRequest.source = data.source;
    reservationRequest.zaloRecipientId = data.zaloRecipientId;
    reservationRequest.zaloSenderId = data.zaloSenderId;
    reservationRequest.payload = data.payload;
    reservationRequest.timestamp = data.timestamp;
    reservationRequest.zaloMessageId = data.zaloMessageId;
    reservationRequest.corId = data.corId;

    return reservationRequest;
  }
}

module.exports = ReservationRequestProvider;
