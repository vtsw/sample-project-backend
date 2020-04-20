const Joi = require('@hapi/joi');

exports.createUserGroupsBinding  = Joi.object({
  userGroupsBinding : Joi.object({
    userId: Joi.string().required(),
    groupId: Joi.string().required(),
  }),
});

