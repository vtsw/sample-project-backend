const gql = require('graphql-tag');

module.exports = gql`
    input bookingOptionsInput {
      doctor: ID!,
      time: Float!,
    }

    input ReservationInput {
      patient: String,
      bookingOptions: [bookingOptionsInput!]!
    }

    type bookingOptions {
      doctor: ID!,
      time: Float!,
    }

    type ReservationRequestPayLoad {
      patient: ID,
      bookingOptions: [bookingOptions!]!
    }

    type ReservationRequest {
      id: ID!,
      zaloRecipientId: ID,
      zaloSenderId: String,
      source: String,
      corID: ID,
      timestamp: String,
      zaloMessageId: ID,
      payload: ReservationRequestPayLoad
    }
    
    type Query {
      reservation: String
    }

    type Mutation {
      createReservationRequest(reservation: ReservationInput!): ReservationRequest  @isAuthenticated
    }
`;
