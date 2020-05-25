const moment = require('moment');
const ObjectId = require('objectid');
const { withFilter } = require('apollo-server-express');
const { EXAMINATION, PATIENT_CONFIRMINATION_EVENTS } = require('../types.js');

const buildZaloListPayload = (examinationTemplate, bookingOptions, config, patient, corId) => {
  const examinationDate = moment(bookingOptions[0].time).format('YYYY-MM-DD');
  const elementList = bookingOptions.map((o) => ({
    title: `${examinationTemplate.element.title} ${o.name} ${examinationTemplate.element.time} ${moment(o.time).format('HH:mm')}`,
    image_url: examinationTemplate.element.image_url,
    default_action: {
      type: examinationTemplate.element.default_action.type,
      url: `${config.zaloApi.confirmationCb}&zaloPatientId=${patient}&userId=${o.doctor}&time=${o.time}&corId=${corId}`,
    },
  }));

  return [{
    title: `${examinationTemplate.header.title} ${examinationDate}`,
    subtitle: examinationTemplate.header.subtitle,
    image_url: examinationTemplate.header.image_url,
  }, ...elementList];
};

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
      const { bookingOptions, patient } = reservation;
      const [zaloUser, examinationTemplate, doctors] = await Promise.all([
        userProvider.findById(loggedUser.id),
        reservationTemplateProvider.findByType(EXAMINATION),
        userProvider.findByIds(bookingOptions.map((o) => o.doctor)),
      ]);
      const requestPayload = bookingOptions.map((itm) => ({
        ...doctors.find((item) => (item.data.id === itm.doctor) && item),
        ...itm,
      })).map((o) => ({
        doctor: o.doctor,
        time: o.time,
        name: o.data.name,
      }));

      const corId = ObjectId();
      const elements = buildZaloListPayload(examinationTemplate, requestPayload, config, patient, corId);
      const { message } = examinationTemplate; message.attachment.payload.elements = elements;
      const zaLoResponse = await zaloMessageSender.sendListElement(message, { zaloId: patient }, zaloUser);

      if (zaLoResponse.error) {
        throw new Error(`Zalo Response: ${zaLoResponse.message}`);
      }

      const reservationRequest = {
        source: 'zalo',
        zaloMessageId: zaLoResponse.data.message_id,
        zaloRecipientId: patient,
        corId,
        userId: req.user.id, // OA sender ID
        payload: {
          patient,
          bookingOptions,
        },
        timestamp: moment().valueOf(),
      };

      return reservationRequestProvider.create(reservationRequest);
    },
  },
  Subscription: {
    onReservationConfirmed: {
      subscribe: withFilter(
        (_, __, { container }) => container.resolve('pubsub').asyncIterator(PATIENT_CONFIRMINATION_EVENTS),
        ({ onReservationConfirmed }, { filter }, { loggedUser }) => {
          return true;
          // if (!filter && onPattientConfirmination.doctor.userId === loggedUser.data.id) { // Fake
          //   return true;
          // }
        },
      ),
    },
  },
  Reservation: {
    // doctor: async (reservation, args, { dataloader, container }) => container.resolve('userProvider').findById(reservation.doctor.userId),
    // return dataloader.getUserByIdList.load(reservation.doctor.userId);
    doctor: (reservation) => ({
      id: reservation.doctor.userId,
      name: reservation.doctor.name,
    }),
    patient: (reservation) => ({
      id: reservation.patient.interestedId,
      displayName: reservation.patient.name,
    }),
  },
};
