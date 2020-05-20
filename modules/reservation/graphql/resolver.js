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
      const loggedUser = req.user;

      const [zaloMessageSender, reservationTemplateProvider, reservationRequestProvider, userProvider] = [
        container.resolve('zaloMessageSender'),
        container.resolve('reservationTemplateProvider'),
        container.resolve('reservationRequestProvider'),
        container.resolve('userProvider'),
      ];

      const zaloUser = await userProvider.findById(loggedUser.id);
      if (!zaloUser) console.log('cannot find user by ID', loggedUser.id);
      console.log(zaloUser);
      const { bookingOptions, patient } = reservation;
      const examinationDate = moment(bookingOptions[0].time).format('YYYY-MM-DD');
      let examinationTemplate = await reservationTemplateProvider.findByType(EXAMINATION);

      const corId = ObjectId();
      const elementList = bookingOptions.map((bookingOption) => {
        const examTime = moment(bookingOption.time).format('HH:mm');
        return {
          title: `${examinationTemplate.element.title} ${bookingOption.doctor} ${examinationTemplate.element.time} ${examTime}`,
          image_url: examinationTemplate.element.image_url,
          default_action: {
            type: examinationTemplate.element.default_action.type,
            url: `https://cleverservice.ngrok.io/api/zalo/reservation/confirmation?type=examination&zaloPatientId=${patient}&zaloDoctorId=${bookingOption.doctor}&time=${bookingOption.time}&corId=${corId}`
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

      const zaLoResponse = await zaloMessageSender.sendListElement(message, { zaloId: patient }, zaloUser);

      if (zaLoResponse.error) {
        console.log('Sender message fail');
        throw new Error(`Zalo Response: ${zaLoResponse.message}`);
      }

      const zaloMessageId = zaLoResponse.data.message_id;

      const reservationRequest = {
        source: "zalo",
        zaloMessageId: zaloMessageId,
        zaloRecipientId: patient,
        zaloSenderId: "2257117504759790782",
        corId: corId,
        cleverSenderId: ObjectId(req.user.id),
        payload: reservation,
        timestamp: moment().valueOf(),
      }

      const result = await reservationRequestProvider.create(reservationRequest);
      return result;
    },
  }
};
