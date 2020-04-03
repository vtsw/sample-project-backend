const { Router } = require('express');
const { isAuthenticated } = require('./middleware');

const router = Router();

router.get('/download/images/:filename', isAuthenticated, async (req, res) => {
  const { minio, userProvider } = req.app.appContenxt;
  const user = await userProvider.findById(req.user.id);
  const { filename } = req.params;
  if (user.image.filename !== filename) {
    return res.send('This resource does not exist or you do not have permission to view the resource.');
  }
  const stat = await minio.statObject('upload', filename);
  const stream = await minio.getObject('upload', filename);
  res.setHeader('Content-disposition', `attachment; filename=${filename}`);
  res.setHeader('Content-encoding', stat.metaData.encoding);
  res.setHeader('Content-Length', stat.size);

  stream.pipe(res);
});


module.exports = router;
