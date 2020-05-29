const { Router } = require('express');
const moment = require('moment');
const { isAuthenticated } = require('./middleware');
const { CONFIRMINATION, RESERVATION_CONFIRM_EVENTS } = require('../modules/reservation/types');

const router = Router();

router.get('/download/images/:filename', isAuthenticated, async (req, res) => {
  const userProvider = req.container.resolve('userProvider');
  const minio = req.container.resolve('minio');
  const user = await userProvider.findById(req.user.id);
  const { filename } = req.params;
  if (user.image.hashedFilename !== filename) {
    res.send('This resource does not exist or you do not have permission to view the resource.');
    return;
  }
  const stat = await minio.statObject('upload', filename);
  const stream = await minio.getObject('upload', filename);
  res.setHeader('Content-disposition', `attachment; filename=${filename}`);
  res.setHeader('Content-encoding', stat.metaData.encoding);
  res.setHeader('Content-Length', stat.size);

  stream.pipe(res);
});

router.post('/zalo/webhook', (req, res) => {
  console.log(req.body.event_name);

  console.log(req.body);
  const { container } = req;
  if (req.body.event_name && req.body.event_name !== 'user_seen_message' && req.body.event_name !== 'user_received_message') { // fake
    const handler = container.resolve('zaloMessageHandlerProvider')
      .provide(req.body.event_name);

    handler.handle(req.body);
  }
  res.status(200);
  res.send('ok');
});

router.get('/zalo/reservation/confirmation', async (req, res) => {
  const { container } = req;
  const [
    handler, reservationRequestProvider, zaloMessageSender, userProvider, zaloInterestedUserProvider,
    messageProvider, reservationTemplateProvider, pubsub,
  ] = await Promise.all([
    container.resolve('reservationProvider'),
    container.resolve('reservationRequestProvider'),
    container.resolve('zaloMessageSender'),
    container.resolve('userProvider'),
    container.resolve('zaloInterestedUserProvider'),
    container.resolve('zaloMessageProvider'),
    container.resolve('reservationTemplateProvider'),
    container.resolve('pubsub'),
  ]);

  const { corId, patientSelected } = req.query;

  const reservationReq = await reservationRequestProvider.findByCorId(corId);

  const { recipient, sender } = reservationReq;

  const doctorSelected = reservationReq.payload.doctors[patientSelected];

  const doctorId = doctorSelected.id; const reservationTime = doctorSelected.time;

  const [oASender, doctor, patient, reservationConfirmTemplate] = await Promise.all([
    userProvider.findById(sender.id),
    userProvider.findById(doctorId),
    zaloInterestedUserProvider.findById(recipient.id),
    reservationTemplateProvider.findByType(CONFIRMINATION),
  ]);

  const { messageTemplate } = reservationConfirmTemplate;

  const message = messageTemplate
    .replace('%pattien_name%', patient.displayName)
    .replace('%doctor_name%', doctor.name)
    .replace('%date%', moment.unix(reservationTime / 1000).format('DD-MM-YYYY'))
    .replace('%time%', moment.unix(reservationTime / 1000).format('HH:mm'));

  const reservation = {
    corId,
    type: 'examination',
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

  await handler.create(reservation);
  const zaloResponse = await zaloMessageSender.sendText({ text: message }, { zaloId: recipient.zaloId }, oASender);

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
    pubsub.publish('ZALO_MESSAGE_SENT', { onZaloMessageSent: createdMessage.toJson() }),
    pubsub.publish('ZALO_MESSAGE_CREATED', { onZaloMessageCreated: createdMessage.toJson() }),
  ]);

  res.send(message);
});

module.exports = router;
