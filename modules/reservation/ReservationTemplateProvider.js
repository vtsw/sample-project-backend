const { ObjectId } = require('mongodb');
const Reservation = require('./Reservation');

class ReservationTemplateProvider {
  /**
   *
   * @param {Collection} reservationTemplate
   */
  constructor(reservationTemplate) {
    this.reservationTemplate = reservationTemplate;
  }

  /**
   * @param {string} type
   * @returns {Promise<reservationTemplate>}
   */
  findByType(type) {
    return this.reservationTemplate.findOne({ type });
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
    const reservation = new Reservation(data._id || data.id);
    reservation.type = data.type;
    reservation.content = data.content;
    return reservation;
  }
}

module.exports = ReservationTemplateProvider;
