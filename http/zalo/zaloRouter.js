const { Router } = require('express');
const QueryString = require('querystring');
const { isAuthenticated } = require('./middleware');

const router = Router();

router.get('/refreshtoken', isAuthenticated, async (req, res) => {
  const zaloProvider = req.container.resolve('zaloProvider');
  const zalo = zaloProvider.findById(req.user.id)

  const { filename } = req.params;

  const stat = await minio.statObject('upload', filename);
  const stream = await minio.getObject('upload', filename);
  res.setHeader('Content-disposition', `attachment; filename=${filename}`);
  res.setHeader('Content-encoding', stat.metaData.encoding);
  res.setHeader('Content-Length', stat.size);

  stream.pipe(res);
});

router.get('/permission/callback', isAuthenticated, async (req, res) => {
  const accessToken = req.query.access_token;
  const oaID = req.query.oaId;
  req.container.zaloProvider.saveOrUpdateOAToken(oaID, accessToken);
})
