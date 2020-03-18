const Joi = require('@hapi/joi');

exports.createMessage = Joi.object({
  message: Joi.object({
    content: Joi.string()
      .min(3)
      .max(255),
  }),
});

exports.updateMessage = Joi.object({
  message: Joi.object({
    id: Joi.string().required(),
    content: Joi.string()
      .min(3)
      .max(255),
  }),
});
