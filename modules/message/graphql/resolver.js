module.exports = {
  Query: {
    message: (_, { id }, { messageProvider }) => messageProvider.findById(id),
    messageList: async (args, { messageProvider }) => {
      const messages = await messageProvider.find();
      return {
        messages,
        total: messages.length,
        hasNext: true,
      };
    },
  },
  Mutation: {
    updateMessage: (_, { message }, { messageProvider }) => messageProvider.update(message.id, message),
    deleteMessage: (_, { id }, { messageProvider }) => messageProvider.delete(id),
  },
};
