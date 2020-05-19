const { ObjectId } = require('mongodb');
const moment = require('moment');
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
   *
   * @param {Object} reservation
   * @returns {Promise<Reservation>}
   */
  async create(reservation) {
    const inserted = await this.reservation.insertOne(reservation);
    return ReservationProvider.factory(inserted.ops[0]);
  }

  /**
 *
 * @param {Object} condition
 * @returns {Promise<*>}
 */
  async find(condition = { page: { limit: 10, skip: 0 }, query: {} }) {
    let { query } = condition;
    console.log(query);
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
    reservation.timestamp = data.timestamp;
    reservation.corId = data.corId;
    reservation.content = data.content;
    return reservation;
  }
}

module.exports = ReservationProvider;
