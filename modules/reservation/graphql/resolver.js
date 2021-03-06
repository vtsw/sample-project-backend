const moment = require('moment');
const ObjectId = require('objectid');
const { withFilter } = require('apollo-server-express');
const { RESERVATION_CONFIRM, EXAMINATION } = require('../types.js');

module.exports = {
  Query: {
    reservationList: async (_, args, { container, req }) => {
      const {
        query: {
          limit, skip,
        },
      } = args;

      const reservationProvider = container.resolve('reservationProvider');
      return reservationProvider.find({ query: { 'sender.id': ObjectId(req.user.id) }, page: { limit, skip } });
    },

    reservationRequestList: async (_, args, { container, req }) => {
      const {
        query: {
          limit, skip,
        },
      } = args;

      const reservationRequestProvider = container.resolve('reservationRequestProvider');
      return reservationRequestProvider.find({ query: { 'sender.id': ObjectId(req.user.id) }, page: { limit, skip } });
    },
  },

  Mutation: {
    createReservationRequest: async (_, { reservation }, { container, req }) => {
      const loggedUser = req.user;
      const [
        zaloMessageSender, reservationRequestProvider, userProvider,
        zaloInterestedUserProvider, templateBuilder] = [
        container.resolve('zaloMessageSender'),
        container.resolve('reservationRequestProvider'),
        container.resolve('userProvider'),
        container.resolve('zaloInterestedUserProvider'),
        container.resolve('templateBuilder'),
      ];

      const { doctors, patient, type } = reservation;
      const doctorIds = doctors.map((doctor) => doctor.id);
      const infoDoctors = await userProvider.findByIds(doctorIds);
      const [sender, recipient] = await Promise.all([
        userProvider.findById(loggedUser.id),
        zaloInterestedUserProvider.findById(patient),
      ]);

      const { oaId } = sender.zaloOA;
      const zaloRecipientId = recipient.followings.find((followingItem) => followingItem.zaloId.OAID === oaId).zaloId.data.zaloIdByOA;
      const mappedDoctors = doctors.map((itm) => ({
        ...infoDoctors.find((item) => (item.data.id === itm.id) && item),
        ...itm,
      }));

      const doctorOptions = mappedDoctors.map((o) => ({
        time: o.time,
        name: o.data.name,
      }));

      const corId = ObjectId();
      const message = await templateBuilder.register(EXAMINATION).build({ doctorOptions, corId });
      const zaLoResponse = await zaloMessageSender.sendListElement(message, recipient, sender);

      if (zaLoResponse.error) {
        throw new Error(`Zalo Response: ${zaLoResponse.message}`);
      }

      const reservationRequest = {
        source: 'zalo',
        type: type || EXAMINATION,
        sender: {
          id: sender.data.id,
          name: sender.name,
          oaId,
        },
        recipient: {
          id: recipient.data.id,
          name: recipient.displayName,
          zaloId: zaloRecipientId,
        },
        messageId: zaLoResponse.data.message_id,
        corId,
        payload: {
          patient: ObjectId(patient),
          doctors,
        },
        timestamp: moment().valueOf(),
      };
      return reservationRequestProvider.create(reservationRequest);
    },
  },
  Subscription: {
    onReservationConfirmed: {
      subscribe: withFilter(
        (_, __, { container }) => container.resolve('pubsub').asyncIterator(RESERVATION_CONFIRM),
        ({ onReservationConfirmed }, { filter }, { loggedUser }) => {
          if (onReservationConfirmed.sender.id === loggedUser.id) {
            return true;
          }
        },
      ),
    },
  },
  ReservationRequest: {
    // doctor: async (reservation, args, { dataloader, container }) => container.resolve('userProvider').findById(reservation.doctor.userId),
    doctors: async (reservation, args, { container }) => {
      const { doctors } = reservation.data.payload;
      const userProvider = container.resolve('userProvider');
      return doctors.map(async (doctor) => {
        const doctorInfo = await userProvider.findById(doctor.id);
        return {
          id: doctorInfo.data.id,
          name: doctorInfo.data.name,
          time: doctor.time,
        };
      });
    },
    patient: (reservation) => ({
      id: reservation.recipient.id,
      name: reservation.recipient.name,
    }),
  },
};
