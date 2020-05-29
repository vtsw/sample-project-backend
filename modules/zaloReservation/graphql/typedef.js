const gql = require('graphql-tag');

module.exports = gql`

    type bookingOptions {
      doctor: String!,
      time: String!,
    }

    input bookingOptions {
      doctor: String!,
      time: String!,
    }

    input ReservationInput {
      patient: String!,
      bookingOptions: [bookingOptions!]!
    }
    
    type Query {
      reservation: String
    }

    type Mutation {
      sendExamimationReservationMessage(reservation: ReservationInput!): String
    }

    input ZaloInterestedUserListInput {
        limit: Int = 10
        skip: Int = 0
    }
`;
