module.exports =  {
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
}
