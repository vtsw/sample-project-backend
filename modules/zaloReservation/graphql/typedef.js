const gql = require('graphql-tag');

module.exports = gql`

  type Query {
    reservation: String
  }

  input bookingOptionsInput {
    doctor: String!,
    time: String!,
  }

  type Mutation {
    sendExamimationReservationMessage(patient: String!, bookingOptions: [bookingOptionsInput!]!): String
    sendTreatmentReservationMessage(patient: String!, bookingOptions: [bookingOptionsInput!]!): String
  }
`;
