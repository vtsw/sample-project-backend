const { Router } = require('express');
const moment = require('moment');
const ObjectId = require('objectid');
const { isAuthenticated } = require('./middleware');
const { CONFIRMINATION, PATIENT_CONFIRMINATION_EVENTS } = require('../modules/reservation/types');

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
    handler, zaloMessageSender, userProvider, zaloInterestedUserProvider,
    messageProvider, reservationTemplateProvider, pubsub,
  ] = await Promise.all([
    container.resolve('reservationProvider'),
    container.resolve('zaloMessageSender'),
    container.resolve('userProvider'),
    container.resolve('zaloInterestedUserProvider'),
    container.resolve('zaloMessageProvider'),
    container.resolve('reservationTemplateProvider'),
    container.resolve('pubsub'),
  ]);

  const {
    zaloPatientId, userId,
    time, corId, type,
  } = req.query;

  const [OAUser, interestedUser, reservationConfirmTemplate] = await Promise.all([
    userProvider.findById(userId),
    zaloInterestedUserProvider.findByOAFollowerId(zaloPatientId),
    reservationTemplateProvider.findByType(CONFIRMINATION),
  ]);

  const { messageTemplate } = reservationConfirmTemplate;

  const reservation = {
    type,
    userId: ObjectId(OAUser.id),
    corId: ObjectId(corId),
    doctor: {
      userId: ObjectId(OAUser.id),
      name: OAUser.name,
      zaloOaId: OAUser.zaloOA.oaId,
    },
    patient: {
      interestedId: ObjectId(interestedUser.id),
      name: interestedUser.displayName,
      zaloRecipientId: zaloPatientId,
    },
    reservationTime: parseInt(time, 10),
    timestamp: moment().valueOf(),
  };

  const message = messageTemplate
    .replace('%pattien_name%', interestedUser.displayName)
    .replace('%doctor_name%', OAUser.name)
    .replace('%date%', moment.unix(time / 1000).format('YYYY-MM-DD'))
    .replace('%time%', moment.unix(time / 1000).format('HH:mm'));

  const reservationCreated = await handler.create(reservation);
  pubsub.publish(PATIENT_CONFIRMINATION_EVENTS, { onPattientConfirmination: reservationCreated.toJson() });
  const zaloResponse = await zaloMessageSender.sendText({ text: message }, { zaloId: zaloPatientId }, OAUser);

  const messageLog = {
    timestamp: moment().valueOf(),
    from: {
      id: ObjectId(OAUser.id),
      displayName: OAUser.name,
      avatar: OAUser.image.link,
    },
    content: message,
    attachments: null,
    to: {
      id: ObjectId(interestedUser.id),
      displayName: interestedUser.displayName,
      avatar: interestedUser.avatar,
    },
    zaloMessageId: zaloResponse.data.message_id,
    type: 'Text',
  };

  await messageProvider.create(messageLog);
  res.send(message);
});

module.exports = router;
