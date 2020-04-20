const Joi = require('@hapi/joi');

exports.createCustomer = Joi.object({
  customer: Joi.object({
    name: Joi.string().required(),
    phoneNo: Joi.string().required(),
  }),
});

