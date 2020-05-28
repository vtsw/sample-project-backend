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

  /**
   * @param {String} corId
   *  @returns {Promise<reservationRequest>}
   */
  findByCorId(corId) {
    return this.reservationRequest.findOne({ corId: ObjectId(corId) });
  }

  /**
 *
 * @param {Object} reservationRequest
 * @returns {Promise<reservationRequest>}
 */
  async create(rawData) {
    const documentToInsert = ReservationRequestProvider.convertDataToMongodbDocument(rawData);
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
      sender: {
        id: ObjectId(rawData.sender.id),
        name: rawData.sender.name,
        oaId: rawData.sender.oaId,
      },
      recipient: {
        id: ObjectId(rawData.recipient.id),
        name: rawData.recipient.name,
        zaloId: rawData.recipient.zaloId,
      },
      payload: {
        patient: ObjectId(rawData.payload.patient),
        doctors: rawData.payload.doctors.map((o) => ({ id: ObjectId(o.id), time: o.time })),
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
    reservationRequest.sender = data.sender;
    reservationRequest.recipient = data.recipient;
    reservationRequest.payload = data.payload;
    reservationRequest.timestamp = data.timestamp;
    reservationRequest.messageId = data.messageId;
    reservationRequest.corId = data.corId;

    // console.log(reservationRequest);

    return reservationRequest;
  }
}

module.exports = ReservationRequestProvider;
