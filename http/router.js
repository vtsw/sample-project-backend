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
  const { container }              = req;
  const handler                    = container.resolve('reservationProvider');
  const zaloMessageSender          = container.resolve('zaloMessageSender');
  const userProvider               = container.resolve('userProvider');
  const zaloInterestedUserProvider = container.resolve('zaloInterestedUserProvider');
  const messageProvider            = container.resolve('zaloMessageProvider');

  const {
    zaloPatientId, userId, 
    time, corId, type
  } = req.query; 

  const [OAUser, interestedUser] = await Promise.all([
    userProvider.findById(userId),
    zaloInterestedUserProvider.findByOAFollowerId(zaloPatientId),
  ]);

  const reservation = {
    type: type,
    userId: ObjectId(OAUser.id),
    corId: ObjectId(corId),
    content: {
      zaloPatientId: zaloPatientId,
      zaloDoctorId: OAUser.zaloOA.oaId,
      reservationTime: parseInt(time),
    },
    timestamp: moment().valueOf(),
  };

  const message      = `Bạn đã hẹn bác sỹ ${OAUser.name} vào ngày ${moment.unix(time / 1000).format("YYYY-MM-DD")} lúc ${moment.unix(time / 1000).format("HH:mm")}`;
  const result       = await handler.create(reservation);
  const zaloResponse = await zaloMessageSender.sendText({text: message}, {zaloId: zaloPatientId});

  const messageLog = {
    timestamp: moment().valueOf(),
    from: {
      id: OAUser.id,
      displayName: OAUser.name,
      avatar: OAUser.image.link
    },
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

module.exports = router;
