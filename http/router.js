const { Router } = require('express');
const moment = require('moment');
const { ObjectId } = require('mongodb');
const { isAuthenticated } = require('./middleware');


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
  const handler = container.resolve('reservationProvider');
  const zaloMessageSender = container.resolve('zaloMessageSender');
  const userProvider = container.resolve('userProvider');
  const zaloInterestedUserProvider = container.resolve('zaloInterestedUserProvider');
  const messageProvider = container.resolve('zaloMessageProvider');

  const {
    zaloPatientId, zaloDoctorId, time, corId, type,
  } = req.query;

  const reservation = {
    type,
    timestamp: moment().unix(),
    corId: ObjectId(corId),
    content: {
      zaloPatientId,
      zaloDoctorId,
      reservationTime: time,
    },
  };

  const [OAUser, interestedUser] = await Promise.all([
    userProvider.findByZaloId(zaloDoctorId),
    zaloInterestedUserProvider.finByOAFollowerId(zaloPatientId),
  ]);

  const message = `Bạn đã hẹn bác sỹ ${zaloDoctorId} vào ngày ${moment.unix(time / 1000).format('YYYY-MM-DD')} lúc ${moment.unix(time / 1000).format('HH:mm')}`;
  const result = await handler.create(reservation);
  const zaloResponse = await zaloMessageSender.sendText({ text: message }, { zaloId: zaloPatientId });

  const messageLog = {
    timestamp: moment().valueOf(),
    from: { ...defaultConfirmationSender },
    content: message,
    attachments: null,
    to: {
      id: interestedUser.id,
      displayName: interestedUser.displayName,
      avatar: interestedUser.avatar,
    },
    zaloMessageId: zaloResponse.data.message_id,
    type: 'Text',
  };

  await messageProvider.create(messageLog);
  res.send(message);
});

const defaultConfirmationSender = {
  id: '5e68995fb6d0bc05829b6e79',
  displayName: 'steve',
  avatar: 'https://localhost:4000/api/download/images/abb90930-95c5-4579-b4d6-8408261dbe5cbc0056e87208a3681730965748c887fc.jpg',
};

module.exports = router;
