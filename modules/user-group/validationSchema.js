const Joi = require('@hapi/joi');

exports.createUserGroup = Joi.object({
  userGroup: Joi.object({
    name: Joi.string().required(),
  }),
});

