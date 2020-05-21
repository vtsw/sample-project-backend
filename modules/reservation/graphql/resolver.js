const moment = require('moment');
const { ObjectId } = require('mongodb');
const { EXAMINATION } = require('../types.js');

module.exports = {
  Query: {
    reservationList: async (_, args, { container, req }) => {
      const {
        query: {
          limit, skip,
        },
      } = args;

      const reservationProvider = container.resolve('reservationProvider');
      return reservationProvider.find({ query: { userId: ObjectId(req.user.id) }, page: { limit, skip } });
    },

    reservationRequestList: async (_, args, { container, req }) => {
      const {
        query: {
          limit, skip,
        },
      } = args;

      const reservationRequestProvider = container.resolve('reservationRequestProvider');
      return reservationRequestProvider.find({ query: { userId: ObjectId(req.user.id) }, page: { limit, skip } });
    },
  },

  Mutation: {
    createReservationRequest: async (_, { reservation }, { container, req }) => {
      const loggedUser = req.user;
      const [zaloMessageSender, reservationTemplateProvider, reservationRequestProvider, userProvider, config] = [
        container.resolve('zaloMessageSender'),
        container.resolve('reservationTemplateProvider'),
        container.resolve('reservationRequestProvider'),
        container.resolve('userProvider'),
        container.resolve('config'),
      ];

      const zaloUser = await userProvider.findById(loggedUser.id);
      const { bookingOptions, patient } = reservation;
      const sendReservation = { ...reservation };
      sendReservation.bookingOptions = bookingOptions.map((o) => ({ doctor: ObjectId(o.doctor), time: o.time }));

      const examinationDate = moment(bookingOptions[0].time).format('YYYY-MM-DD');
      const examinationTemplate = await reservationTemplateProvider.findByType(EXAMINATION);

      const corId = ObjectId();
      const elementList = bookingOptions.map((o) => {
        const examTime = moment(o.time).format('HH:mm');
        return {
          title: `${examinationTemplate.element.title} ${o.doctor} ${examinationTemplate.element.time} ${examTime}`,
          image_url: examinationTemplate.element.image_url,
          default_action: {
            type: examinationTemplate.element.default_action.type,
            url: `${config.zaloApi.confirmationCb}?type=examination&zaloPatientId=${patient}&userId=${o.doctor}&time=${o.time}&corId=${corId}`,
          },
        };
      });

      const elements = [{
        title: `${examinationTemplate.header.title} ${examinationDate}`,
        subtitle: examinationTemplate.header.subtitle,
        image_url: examinationTemplate.header.image_url,
      }, ...elementList];

      const { message } = examinationTemplate;
      message.attachment.payload.elements = elements;

      const zaLoResponse = await zaloMessageSender.sendListElement(message, { zaloId: patient }, zaloUser);

      if (zaLoResponse.error) {
        throw new Error(`Zalo Response: ${zaLoResponse.message}`);
      }

      const reservationRequest = {
        source: 'zalo',
        zaloMessageId: zaLoResponse.data.message_id,
        zaloRecipientId: patient,
        corId,
        userId: ObjectId(req.user.id),
        payload: sendReservation,
        timestamp: moment().valueOf(),
      };

      return reservationRequestProvider.create(reservationRequest);
    },
  },
};
