const Joi = require('@hapi/joi');

exports.createZaloSocialAccount = Joi.object({
  zaloSocialAccount: Joi.object({
    socialId: Joi.string().required(),
    socialInfo: Joi.any(),
  }),
});
