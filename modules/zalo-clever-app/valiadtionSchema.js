const Joi = require('@hapi/joi');

exports.createZaloCleverApp = Joi.object({
  zaloCleverApp : Joi.object({
    appId: Joi.string().required(),
    appSecret: Joi.string().required(),
    appCallbackUrl:  Joi.string().required(),
  }),
});

