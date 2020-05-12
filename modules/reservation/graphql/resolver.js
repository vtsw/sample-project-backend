const { EXAMINATION } = require('../types');
const moment = require('moment');

module.exports = {
  Query: {
    reservation: async (_, { }, { container }) => {
      return 'reservation';
    },
  },

  Mutation : {
    sendExamimationReservationMessage: async (_, {reservation}, { container, req }) => {
      const zaloMessageSender = container.resolve('zaloMessageSender');
      const zaloReservationTemplateProvider = container.resolve('reservationTemplateProvider');

      const {bookingOptions} = reservation;
      const examinationDate = moment(bookingOptions[0].time, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD');
      let examinationTemplate = await zaloReservationTemplateProvider.findByType(EXAMINATION);

      const elementList = bookingOptions.map(o => {
        const examTime = moment(o.time, 'YYYY-MM-DD HH:mm').format('HH:mm');
        return {
          title: `${examinationTemplate.element.title} ${o.doctor} ${examinationTemplate.element.time} ${examTime}`,
          image_url: examinationTemplate.element.image_url,
          default_action: {
            type: examinationTemplate.element.default_action.type,
            url: `https://96e9f924.ngrok.io/api/zalo/handlerClick?type=examination&userId=5953238198052633581&doctorId=${o.doctor}&time=${o.time}`
          }
        }
      });

      const elements = [{
        title: `${examinationTemplate.header.title} ${examinationDate}`,
        subtitle: examinationTemplate.header.subtitle,
        image_url: examinationTemplate.header.image_url
      }, ... elementList];

      let message = examinationTemplate.message;
      message.attachment.payload.elements = elements;

      // const response = await zaloMessageSender.sendMessage(message, {zaloId: "5953238198052633581"});

      return '12313';
    },
  }
};
