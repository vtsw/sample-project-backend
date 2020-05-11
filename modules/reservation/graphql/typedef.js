const gql = require('graphql-tag');

module.exports = gql`
    input bookingOptionsInput {
      doctor: String!,
      time: String!,
    }

    input ReservationInput {
      patient: String,
      bookingOptions: [bookingOptionsInput!]!
    }
    
    type Query {
      reservation: String
    }

    type Mutation {
      sendExamimationReservationMessage(reservation: ReservationInput!): String
    }
`;
