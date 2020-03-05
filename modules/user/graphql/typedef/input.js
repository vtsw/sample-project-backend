module.exports = `
  input CreateUserInput {
    password: String!
    name: String!
    email: String!
  }
  
  input UpdateUserInput {
    _id: ID!
    name: String
    email: String
    password: String
  }
  `
;
