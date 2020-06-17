const { merge } = require('lodash');
const { GraphQLUpload } = require('graphql-upload');
const zaloOAResolvers = require('./zaloOfficialAccount/graphql/resolver');
const zaloMessageResolver = require('./zaloMessage/graphql/resolver');
const zaloSocialAccountResolver = require('./zaloSocialAccount/graphql/resolver');

const baseResolver = {
  Upload: GraphQLUpload,
  Mutation: {
    hello: (_, { name }, { container }) => {
      const scheduleNotificationSender = container.resolve('scheduleNotificationSender');
      scheduleNotificationSender.sendScheduleNotification();
      return name || 'world';
    },
  },
  Query: {
    hello: () => 'world',
  },
};

module.exports = merge(baseResolver, zaloOAResolvers, zaloMessageResolver, zaloSocialAccountResolver);
