module.exports = {
  Query: {
    message: (_, { id }, { messageProvider }) => messageProvider.findById(id),
    messageList: async (_, { query: { searchText, limit, skip } }, { messageProvider }) => {
      const content = searchText ? new RegExp(`/\b${searchText}\b/`) : {};
      return messageProvider
        .findWithPagination({ query: { content }, page: { limit, skip } });
    },
  },
  Mutation: {
    createMessage: (source, { message }, { messageProvider, req }) => messageProvider.create({
      ...message,
      userId: req.user.id,
    }),
    updateMessage: (_, { message }, { messageProvider }) => messageProvider.update(message.id, message),
    deleteMessage: (_, { id }, { messageProvider }) => messageProvider.delete(id),
  },
};
