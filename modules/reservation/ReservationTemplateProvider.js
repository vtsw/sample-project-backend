const { ObjectId } = require('mongodb');
const moment = require('moment');
const ZaloReservation = require('./Reservation');

class ReservationTemplateProvider {
  /**
   *
   * @param {Collection} reservationTemplate
   */
  constructor(reservationTemplate) {
    this.reservationTemplate = reservationTemplate;
  }

  findByType(type) {
    return this.reservationTemplate.findOne({type: type})
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

module.exports = ReservationTemplateProvider;
