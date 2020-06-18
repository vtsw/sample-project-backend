const { merge } = require('lodash');
const { GraphQLUpload } = require('graphql-upload');
const zaloOAResolvers = require('./zaloOfficialAccount/graphql/resolver');
const zaloMessageResolver = require('./zaloMessage/graphql/resolver');
const zaloSocialAccountResolver = require('./zaloSocialAccount/graphql/resolver');

const baseResolver = {
  Upload: GraphQLUpload,
  Mutation: {
    // eslint-disable-next-line arrow-body-style
    hello: (_, { name }) => {
      return name || 'world';

      // const scheduleNotificationSender = container.resolve('scheduleNotificationSender');
      // scheduleNotificationSender.sendScheduleNotification();
    },
  },
  Query: {
    hello: () => 'world',
  },
};

module.exports = merge(baseResolver, zaloOAResolvers, zaloMessageResolver, zaloSocialAccountResolver);
