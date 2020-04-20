const Joi = require('@hapi/joi');

exports.createZaloSocialAccount  = Joi.object({
  zaloSocialAccount : Joi.object({
    socialId: Joi.string().required(),
    socialAccessToken: Joi.string().required(),
    socialAccessTokenLastUpdated: Joi.string().required(),
    zaloCleverApp: Joi.string().required(),
    socialInfo: Joi.any()
  }),
});

