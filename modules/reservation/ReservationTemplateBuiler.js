// const { ObjectId } = require('mongodb');
const moment = require('moment');
const { EXAMINATION, CONFIRMINATION } = require('./types');

class ReservationTemplateBuiler {
  /**
   * @param templateProvider
   */
  constructor(templateProvider, config) {
    this.config = config;
    this.templateProvider = templateProvider;
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
  // eslint-disable-next-line consistent-return
  build(rawData) {
    switch (this.type) {
      case EXAMINATION:
        return this.buildExamination(rawData);
      case CONFIRMINATION:
        break;
      default:
    }
  }

  /**
   * @param {Object} rawData
   * @returns {Promise<*>}
   */
  async buildExamination(rawData) {
    const { doctorOptions, corId } = rawData;
    const template = await this.templateProvider.findByType(this.type);
    const { message } = template;
    const examinationDate = moment(doctorOptions[0].time).format('YYYY-MM-DD');
    const elementList = doctorOptions.map((doctor, index) => ({
      title: `${template.element.title} ${doctor.name} ${template.element.time} ${moment(doctor.time).format('HH:mm')}`,
      image_url: template.element.image_url,
      default_action: {
        type: template.element.default_action.type,
        url: `${this.config.zaloApi.confirmationCb}&corId=${corId}&patientSelected=${index}`,
      },
    }));

    const payload = [{
      title: `${template.header.title} ${examinationDate}`,
      subtitle: template.header.subtitle,
      image_url: template.header.image_url,
    }, ...elementList];

    message.attachment.payload.elements = payload;
    return message;
  }
}

module.exports = ReservationTemplateBuiler;
