const { Router } = require('express');
const { isAuthenticated } = require('./middleware');
const moment = require('moment');

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

router.post('/zalo/webhook', async (req, res) => {
  const { container } = req;
  if (req.body.event_name) {
    const handler = container.resolve('zaloMessageHandlerProvider')
      .provide(req.body.event_name);
    const data = await handler.mapDataFromZalo(req.body);
    handler.handle(data);
  }
  res.status(200);
  res.send('ok');
});

router.get('/zalo/handlerClick', async (req, res) => {
  const { container } = req;

  const handler = container.resolve('reservationProvider');

  const raw = req.query;

  console.log(raw);

  let reservation = {
    type: raw.type,
    timestamp: moment().valueOf(),
    content: {
      zaloPatientId: raw.patient,
      doctorId: raw.doctorId,
      timeUnix: moment(raw.time, "YYYY-MM-DD HH:mm").unix(),
      timeString: raw.time
    }
  }

  const result = await handler.create(reservation);

  res.send(result)
})


module.exports = router;
