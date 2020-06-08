// const { ObjectId } = require('mongodb');
const moment = require('moment');
const { EXAMINATION, CONFIRMATION } = require('./types');
const reservationCallBackRoute = require('../../http/reservation');
const httpApiRoute = require('../../http');

class ReservationTemplateBuiler {
  /**
   * @param templateProvider
   */
  constructor(templateProvider, config) {
    this.templateProvider = templateProvider;
    this.config = config;
    this.type = null;
  }

  /**
   * @param {String} type
   */
  register(type) {
    this.type = type;
    return this;
  }

  /**
 * @param {Object} condition
 * @returns {Promise<*>}
 */
  build(rawData) {
    let message;
    switch (this.type) {
      case EXAMINATION:
        message = this.buildExaminationMessage(rawData);
        break;
      case CONFIRMATION:
        message = this.buildConfirmationMessage(rawData);
        break;
      default:
    }

    return message;
  }

  /**
   * @param {Object} rawData
   * @returns {Promise<*>}
   */
  async buildExaminationMessage(rawData) {
    const { doctorOptions, corId } = rawData;
    const template = await this.templateProvider.findByType(this.type === null ? 'EXAMINATION' : this.type);
    const { message } = template;
    const examinationDate = moment(doctorOptions[0].time).format('YYYY-MM-DD');
    const elementList = doctorOptions.map((doctor, index) => ({
      title: `${template.element.title} ${doctor.name} ${template.element.time} ${moment(doctor.time).format('HH:mm')}`,
      image_url: template.element.image_url,
      default_action: {
        type: template.element.default_action.type,
        // eslint-disable-next-line max-len
        url: `${this.config.app.host}${httpApiRoute.path.HTTP_API_ROOT}${reservationCallBackRoute.path.ZALO_RESERVATION_CONFIRMATION}`
          + `?type=${this.type}`
          + `&corId=${corId}`
          + `&patientSelected=${index}`,
      },
    }));
    console.log(elementList);
    const payload = [{
      title: `${template.header.title} ${examinationDate}`,
      subtitle: template.header.subtitle,
      image_url: template.header.image_url,
    }, ...elementList];

    message.attachment.payload.elements = payload;
    return message;
  }

  /**
   * @param {Object} rawData
   * @returns {Promise<String>}
   */
  async buildConfirmationMessage(rawData) {
    const { patientName, doctorName, reservationTime } = rawData;
    const template = await this.templateProvider.findByType(this.type);

    const { messageTemplate } = template;

    const message = messageTemplate
      .replace('%pattien_name%', patientName)
      .replace('%doctor_name%', doctorName)
      .replace('%date%', moment.unix(reservationTime / 1000).format('DD-MM-YYYY'))
      .replace('%time%', moment.unix(reservationTime / 1000).format('HH:mm'));

    return message;
  }
}

module.exports = ReservationTemplateBuiler;
