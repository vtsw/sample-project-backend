const Joi = require('@hapi/joi');

exports.createZaloOA = Joi.object({
  zaloOA: Joi.object({
    oaId: Joi.string().required(),
    appId: Joi.string().required(),
    oaAccessToken: Joi.string().required(),
    oaAccessTokenLastUpdatedTime: Joi.string().required(),
    oaInfo: Joi.any(),
  }),
});

