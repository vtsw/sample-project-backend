const Joi = require('@hapi/joi');

exports.createUser = Joi.object({
  user: Joi.object({
    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    password: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
    name: Joi.string().min(3).max(255)
      .required(),
    zaloOA: Joi.object({
      accessToken: Joi.string(),
      oaId: Joi.string(),
      secretKey: Joi.string(),
    }),
  }),
});


exports.updateUser = Joi.object({
  user: Joi.object({
    id: Joi.string().required(),
    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    name: Joi.string().min(3).max(255),
    password: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    zaloOA: Joi.object({
      accessToken: Joi.string(),
      oaId: Joi.string(),
      secretKey: Joi.string(),
    }),
  }),
});

exports.login = Joi.object({
  user: Joi.object({
    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    password: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
  }),
});
