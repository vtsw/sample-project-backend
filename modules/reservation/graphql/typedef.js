const gql = require('graphql-tag');

module.exports = gql`
    input bookingOptionsInput {
      doctor: ID!,
      time: String!,
    }

    input ReservationInput {
      patient: String,
      bookingOptions: [bookingOptionsInput!]!
    }

    type bookingOptions {
      doctor: ID!,
      time: String!,
    }

    type ReservationRequestPayLoad {
      patient: ID,
      bookingOptions: [bookingOptions!]!
    }

    type ReservationRequest {
      id: ID!,
      recipientId: ID,
      senderId: String,
      source: String,
      timestamp: String,
      payload: ReservationRequestPayLoad
    }
    
    type Query {
      reservation: String
    }

    type Mutation {
      sendExamimationReservationMessage(reservation: ReservationInput!): ReservationRequest  @isAuthenticated
    }
`;
