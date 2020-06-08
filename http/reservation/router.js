const moment = require('moment');
const { Router } = require('express');

const { ZALO_MESSAGE_SENT, ZALO_MESSAGE_CREATED } = require('../../modules/zaloMessage/events');
const { CONFIRMATION, RESERVATION_CONFIRM } = require('../../modules/reservation/types');

const path = require('./path');

const router = Router();

router.get(path.ZALO_RESERVATION_CONFIRMATION, async (req, res) => {
  const { container } = req;
  const [
    handler, reservationRequestProvider, zaloMessageSender, userProvider, zaloInterestedUserProvider,
    messageProvider, pubsub, templateBuilder,
  ] = await Promise.all([
    container.resolve('reservationProvider'),
    container.resolve('reservationRequestProvider'),
    container.resolve('zaloMessageSender'),
    container.resolve('userProvider'),
    container.resolve('zaloInterestedUserProvider'),
    container.resolve('zaloMessageProvider'),
    container.resolve('pubsub'),
    container.resolve('templateBuilder'),
  ]);

  const { corId, patientSelected, type } = req.query;

  const reservationReq = await reservationRequestProvider.findByCorId(corId);

  const { recipient, sender } = reservationReq;

  const doctorSelected = reservationReq.payload.doctors[patientSelected];

  const doctorId = doctorSelected.id; const reservationTime = doctorSelected.time;

  const [oASender, doctor, patient] = await Promise.all([
    userProvider.findById(sender.id),
    userProvider.findById(doctorId),
    zaloInterestedUserProvider.findById(recipient.id),
  ]);

  const message = await templateBuilder
    .register(CONFIRMATION)
    .build({ patientName: patient.displayName, doctorName: doctor.name, reservationTime });

  const reservation = {
    corId,
    type,
    sender: {
      id: oASender.id,
      name: oASender.name,
      oaId: oASender.zaloOA.oaId,
    },
    doctor: {
      id: doctor.id,
      name: doctor.name,
      oaId: doctor.zaloOA.oaId,
    },
    patient: {
      id: patient.id,
      name: patient.displayName,
      zaloId: recipient.zaloId,
    },
    time: parseInt(reservationTime, 10),
    timestamp: moment().valueOf(),
  };

  const reservationCreated = await handler.create(reservation);
  const zaloResponse = await zaloMessageSender.sendText({ text: message }, patient, oASender);

  const messageLog = {
    timestamp: moment().valueOf(),
    from: {
      id: oASender.id,
      displayName: oASender.name,
      avatar: oASender.image.link,
    },
    content: message,
    attachments: null,
    to: {
      id: patient.id,
      displayName: patient.displayName,
      avatar: patient.avatar,
    },
    zaloMessageId: zaloResponse.data.message_id,
    type: 'Text',
  };
  const createdMessage = await messageProvider.create(messageLog);

  await Promise.all([
    pubsub.publish(ZALO_MESSAGE_SENT, { onZaloMessageSent: createdMessage.toJson() }),
    pubsub.publish(ZALO_MESSAGE_CREATED, { onZaloMessageCreated: createdMessage.toJson() }),
    pubsub.publish(RESERVATION_CONFIRM, { onReservationConfirmed: reservationCreated.toJson() }),
  ]);

  res.send(message);
});

module.exports = router;
