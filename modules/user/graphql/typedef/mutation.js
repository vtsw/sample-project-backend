export const typeDef = `
  extend type Mutation {
    login(user: LoginUserInput!): AuthPayload
    createUser(user: CreateUserInput!): User @isAuthenticated
    updateUser(user: UpdateUserInput!): User @isAuthenticated
  }
`;
