const moment = require('moment');
const ObjectId = require('objectid');
const { withFilter } = require('apollo-server-express');
const { zaloApi } = require('../../../config');
const { EXAMINATION, RESERVATION_CONFIRM_EVENTS } = require('../types.js');

const buildZaloListPayload = (examinationTemplate, doctorOptions, corId) => {
  const examinationDate = moment(doctorOptions[0].time).format('YYYY-MM-DD');
  const elementList = doctorOptions.map((doctor, index) => ({
    title: `${examinationTemplate.element.title} ${doctor.name} ${examinationTemplate.element.time} ${moment(doctor.time).format('HH:mm')}`,
    image_url: examinationTemplate.element.image_url,
    default_action: {
      type: examinationTemplate.element.default_action.type,
      // url: `${zaloApi.confirmationCb}&zaloPatientId=${patient}&userId=${o.doctor}&time=${o.time}&corId=${corId}`,
      url: `${zaloApi.confirmationCb}&corId=${corId}&patientSelected=${index}`,
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
      try {
        const loggedUser = req.user;
        const [zaloMessageSender, reservationTemplateProvider, reservationRequestProvider, userProvider, zaloInterestedUserProvider] = [
          container.resolve('zaloMessageSender'),
          container.resolve('reservationTemplateProvider'),
          container.resolve('reservationRequestProvider'),
          container.resolve('userProvider'),
          container.resolve('zaloInterestedUserProvider'),
        ];
        const { doctors, patient } = reservation;
        const doctorIds = doctors.map((doctor) => doctor.id);
        const infoDoctors = await userProvider.findByIds(doctorIds);
        const [sender, examinationTemplate, recipient] = await Promise.all([
          userProvider.findById(loggedUser.id),
          reservationTemplateProvider.findByType(EXAMINATION),
          zaloInterestedUserProvider.findById(patient),
        ]);

        const { oaId } = sender.zaloOA;
        const zaloRecipientId = recipient.data.followings.find((followingItem) => followingItem.zaloId === oaId).OAFollowerId;

        const mappedDoctors = doctors.map((itm) => ({
          ...infoDoctors.find((item) => (item.data.id === itm.id) && item),
          ...itm,
        }));

        const doctorOptions = mappedDoctors.map((o) => ({
          time: o.time,
          name: o.data.name,
        }));

        const corId = ObjectId();
        const elements = buildZaloListPayload(examinationTemplate, doctorOptions, corId);
        const { message } = examinationTemplate; message.attachment.payload.elements = elements;
        const zaLoResponse = await zaloMessageSender.sendListElement(message, { zaloId: zaloRecipientId }, sender);

        if (zaLoResponse.error) {
          throw new Error(`Zalo Response: ${zaLoResponse.message}`);
        }

        const reservationRequest = {
          source: 'zalo',
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
        return await reservationRequestProvider.create(reservationRequest);
      } catch (err) {
        console.log(err);
      }
    },
  },
  Subscription: {
    onReservationConfirmed: {
      subscribe: withFilter(
        (_, __, { container }) => container.resolve('pubsub').asyncIterator(RESERVATION_CONFIRM_EVENTS),
        ({ onReservationConfirmed }, { filter }, { loggedUser }) => {
          console.log('12312312');
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
    // doctor: (reservation) => ({
    //   id: reservation.doctor.userId,
    //   name: reservation.doctor.name,
    // }),
    // patient: (reservation) => ({
    //   id: reservation.patient.interestedId,
    //   displayName: reservation.patient.name,
    // }),
  },
  ReservationRequest: {
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
