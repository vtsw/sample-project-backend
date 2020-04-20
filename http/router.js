const { Router } = require('express');
const utils = require('../config/utils');
const fetch = require('node-fetch');
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

router.get('/zalo/webhook', (req, res) => {
  res.json(req.query);
});


module.exports = router;
