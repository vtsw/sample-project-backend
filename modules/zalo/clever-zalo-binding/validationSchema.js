const Joi = require('@hapi/joi');

exports.createCleverZaloBinding = Joi.object({
  cleverZaloBinding: Joi.object({
    userId: Joi.string().required(),
    zaloOAId: Joi.string().required(),
  }),
});

