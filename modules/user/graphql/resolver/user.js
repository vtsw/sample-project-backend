export const user = {
  User: {
    messages: (user, _, { dataloaders }) => dataloaders.getMessageByUser.load(user.id),
  },
}
