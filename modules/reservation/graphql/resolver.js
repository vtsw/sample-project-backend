const { EXAMINATION } = require('../types');
const moment = require('moment');
const { ObjectId } = require('mongodb');

module.exports = {
  Query: {
    reservation: async (_, { }, { container }) => {
      return 'reservation';
    },

    reservationList:  async (_, args, { container, req }) => {
      const {
        query: {
          limit, skip,
        },
      } = args;

      const reservationProvider = container.resolve('reservationProvider');

      return await reservationProvider.find({ query: { }, page: { limit, skip } });
    }
  },

  Mutation: {
    createReservationRequest: async (_, { reservation }, { container, req }) => {
      const [zaloMessageSender, reservationTemplateProvider, reservationRequestProvider] = [
        container.resolve('zaloMessageSender'),
        container.resolve('reservationTemplateProvider'),
        container.resolve('reservationRequestProvider')
      ];

      const { bookingOptions, patient } = reservation;
      reservation.bookingOptions = bookingOptions.map(o => {return {doctor: ObjectId(o.doctor), time: o.time}})

      const examinationDate = moment(bookingOptions[0].time).format('YYYY-MM-DD');
      let examinationTemplate = await reservationTemplateProvider.findByType(EXAMINATION);

      const corId = ObjectId();
      const elementList = bookingOptions.map(o => {
        const examTime = moment(o.time).format('HH:mm');
        return {
          title: `${examinationTemplate.element.title} ${o.doctor} ${examinationTemplate.element.time} ${examTime}`,
          image_url: examinationTemplate.element.image_url,
          default_action: {
            type: examinationTemplate.element.default_action.type,
            url: `https://dfefcc02.ngrok.io/api/zalo/reservation/confirmation?type=examination&zaloPatientId=${patient}&userId=${o.doctor}&time=${o.time}&corId=${corId}`
          }
        }
      });

      const elements = [{
        title: `${examinationTemplate.header.title} ${examinationDate}`,
        subtitle: examinationTemplate.header.subtitle,
        image_url: examinationTemplate.header.image_url
      }, ...elementList];

      let message = examinationTemplate.message;
      message.attachment.payload.elements = elements;

      const zaLoResponse = await zaloMessageSender.sendListElement(message, { zaloId: patient });

      if (zaLoResponse.error) {
        console.log('Sender message fail');
        throw new Error(`Zalo Response: ${zaLoResponse.message}`);
      }

      const reservationRequest = {
        source: "zalo",
        zaloMessageId:  zaLoResponse.data.message_id,
        zaloRecipientId: patient,
        // zaloSenderId: "4368496045530866759", // This id get from account hard code
        corId: corId,
        userId: ObjectId(req.user.id),
        payload: reservation,
        timestamp: moment().valueOf(),
      };

      return await reservationRequestProvider.create(reservationRequest);
    },
  }
};
