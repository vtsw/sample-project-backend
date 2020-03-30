const express = require('express');
const { isAuthenticated } = require('./middleware');

const router = express.Router();

router.use('/download/images/:filename', isAuthenticated, async (req, res) => {
  const { minio } = req.app.appContenxt;
  const { filename } = req.params;
  const stat = await minio.statObject('upload', filename);
  const stream = await minio.getObject('upload', filename);
  res.setHeader('Content-disposition', `attachment; filename=${filename}`);
  res.setHeader('Content-type', stat.metaData['content-type']);
  res.setHeader('Content-encoding', stat.metaData.encoding);
  res.setHeader('Content-Length', stat.size);

  stream.pipe(res);
});


module.exports = router;
