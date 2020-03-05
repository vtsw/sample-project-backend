export const mutation = {
  Mutation: {
    createMessage: (source, { message }, { messageProvider }) => messageProvider.create(message),
    createUser: (_, { user }, { authenService }) => authenService.register(user)
  }
}
