const { ObjectId } = require('mongodb');
const Reservation = require('./Reservation');

class ReservationProvider {
  /**
   *
   * @param {Collection} reservation
   */
  constructor(reservation) {
    this.reservation = reservation;
  }

  /**
   * @param {Object} rawData
   * @returns {Promise<Reservation>}
   */
  async create(rawData) {
    const documentToInsert = ReservationProvider.convertDataToMongodbDocument(rawData);
    const inserted = await this.reservation.insertOne(documentToInsert);
    return ReservationProvider.factory(inserted.ops[0]);
  }

  /**
   * @param {Object} rawData
   * @returns {null|reservation}
   */

  static convertDataToMongodbDocument(rawData) {
    return Object.assign(rawData, {
      corId: ObjectId(rawData.corId),
      sender: {
        id: ObjectId(rawData.sender.id),
        name: rawData.sender.name,
        oaId: rawData.sender.oaId,
      },
      doctor: {
        id: ObjectId(rawData.doctor.id),
        name: rawData.doctor.name,
        oaId: rawData.doctor.oaId,
      },
      patient: {
        patient: ObjectId(rawData.patient.id),
        name: rawData.patient.name,
        zaloId: rawData.patient.zaloId,
      },
    });
  }

  /**
 * @param {Object} condition
 * @returns {Promise<*>}
 */
  async find(condition = { page: { limit: 10, skip: 0 }, query: {} }) {
    const { query } = condition;
    const items = await this.reservation
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
      items: items.map(ReservationProvider.factory),
      total: items.length,
    };
  }


  /**
   *
   * @param {Object} rawData
   * @returns {null|Reservation}
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
    const reservation = new Reservation(data._id || data.id);
    reservation.type = data.type;
    reservation.corId = data.corId;
    reservation.userId = data.userId;
    reservation.doctor = data.doctor;
    reservation.patient = data.patient;
    reservation.timestamp = data.timestamp;
    reservation.reservationTime = data.reservationTime;
    return reservation;
  }
}

module.exports = ReservationProvider;
