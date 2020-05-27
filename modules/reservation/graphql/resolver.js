const moment = require('moment');
const ObjectId = require('objectid');
const { withFilter } = require('apollo-server-express');
const { zaloApi } = require('../../../config');
const { EXAMINATION, RESERVATION_CONFIRM_EVENTS } = require('../types.js');

const buildZaloListPayload = (examinationTemplate, bookingOptions, patient, corId) => {
  const examinationDate = moment(bookingOptions[0].time).format('YYYY-MM-DD');
  const elementList = bookingOptions.map((o) => ({
    title: `${examinationTemplate.element.title} ${o.name} ${examinationTemplate.element.time} ${moment(o.time).format('HH:mm')}`,
    image_url: examinationTemplate.element.image_url,
    default_action: {
      type: examinationTemplate.element.default_action.type,
      url: `${zaloApi.confirmationCb}&zaloPatientId=${patient}&userId=${o.doctor}&time=${o.time}&corId=${corId}`,
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
      const [zaloMessageSender, reservationTemplateProvider, reservationRequestProvider, userProvider, zaloInterestedUserProvider] = [
        container.resolve('zaloMessageSender'),
        container.resolve('reservationTemplateProvider'),
        container.resolve('reservationRequestProvider'),
        container.resolve('userProvider'),
        container.resolve('zaloInterestedUserProvider'),
      ];
      const { bookingOptions, patient } = reservation;
      const [sender, examinationTemplate, doctors, recipient] = await Promise.all([
        userProvider.findById(loggedUser.id),
        reservationTemplateProvider.findByType(EXAMINATION),
        userProvider.findByIds(bookingOptions.map((o) => o.doctor)),
        zaloInterestedUserProvider.findById(patient),
      ]);
      const { oaId } = sender.zaloOA;
      const zaloRecipientId = recipient.data.followings.find((o) => o.zaloId === oaId).OAFollowerId;
      const requestPayload = bookingOptions.map((itm) => ({
        ...doctors.find((item) => (item.data.id === itm.doctor) && item),
        ...itm,
      })).map((o) => ({
        doctor: o.doctor,
        time: o.time,
        name: o.data.name,
      }));

      const corId = ObjectId();
      const elements = buildZaloListPayload(examinationTemplate, requestPayload, zaloRecipientId, corId);
      const { message } = examinationTemplate; message.attachment.payload.elements = elements;
      const zaLoResponse = await zaloMessageSender.sendListElement(message, { zaloId: zaloRecipientId }, sender);

      if (zaLoResponse.error) {
        throw new Error(`Zalo Response: ${zaLoResponse.message}`);
      }

      const reservationRequest = {
        source: 'zalo',
        sender: {
          id: sender.data.id,
          oaId,
        },
        recipient: {
          id: recipient.data.id,
          zaloId: zaloRecipientId,
        },
        messageId: zaLoResponse.data.message_id,
        corId,
        payload: {
          patient: ObjectId(patient),
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
        (_, __, { container }) => container.resolve('pubsub').asyncIterator(RESERVATION_CONFIRM_EVENTS),
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
  ReservationRequest: {
    patient: async (reservation, args, { container }) => {
      const zaloInterestedUserProvider = container.resolve('zaloInterestedUserProvider');
      const interestedId = reservation.data.payload.patient;
      const patient = await zaloInterestedUserProvider.findById(interestedId);
      return {
        id: patient.data.id,
        displayName: patient.data.displayName,
      };
    },
    doctors: async (reservation, args, { container }) => {
      const userProvider = container.resolve('userProvider');
      const { bookingOptions } = reservation.data.payload;

      return bookingOptions.map(async (o) => {
        const doctor = await userProvider.findById(o.doctor);
        return {
          id: o.doctor,
          name: doctor.name,
          time: o.time,
        };
      });
    },
  },
};
