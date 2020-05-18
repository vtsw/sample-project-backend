const { Router } = require('express');
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
  if (req.body.event_name) {
    const handler = container.resolve('zaloMessageHandlerProvider')
      .provide(req.body.event_name);
    handler.handle(req.body);
  }
  res.status(200);
  res.send('ok');
});


module.exports = router;
