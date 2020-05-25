const { ObjectId } = require('mongodb');
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
    return this.reservationRequest.findOne();
  }

  /**
 *
 * @param {Object} reservationRequest
 * @returns {Promise<reservationRequest>}
 */
  async create(reservationRequest) {
    const documentToInsert = ReservationRequestProvider.convertDataToMongodbDocument(reservationRequest);
    const inserted = await this.reservationRequest.insertOne(documentToInsert);
    return ReservationRequestProvider.factory(inserted.ops[0]);
  }


  /**
 *
 * @param {Object} condition
 * @returns {Promise<*>}
 */
  async find(condition = { page: { limit: 10, skip: 0 }, query: {} }) {
    const { query } = condition;
    const items = await this.reservationRequest
      .find(query)
      .limit(condition.page.limit + 1)
      .skip(condition.page.skip).sort({ timestamp: -1 })
      .toArray();

    const hasNext = (items.length === condition.page.limit + 1);

    if (hasNext) {
      items.pop();
    }

    return {
      hasNext,
      items: items.map(ReservationRequestProvider.factory),
      total: items.length,
    };
  }

  /**
   * @param {Object} rawData
   * @returns {null|ZaloInterestedUser}
   */

  static convertDataToMongodbDocument(rawData) {
    return Object.assign(rawData, {
      payload: {
        patient: rawData.payload.patient,
        bookingOptions: rawData.payload.bookingOptions.map((o) => ({ doctor: ObjectId(o.doctor), time: o.time })),
      },
    });
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
    reservationRequest.userId = data.userId;
    reservationRequest.payload = data.payload;
    reservationRequest.timestamp = data.timestamp;
    reservationRequest.zaloMessageId = data.zaloMessageId;
    reservationRequest.corId = data.corId;

    return reservationRequest;
  }
}

module.exports = ReservationRequestProvider;
