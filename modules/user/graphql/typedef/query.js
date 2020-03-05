module.exports =  `
  extend type Query {
    user(id: String!): User @isAuthenticated
    userList: UserList @isAuthenticated
  }
`;
