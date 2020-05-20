const gql = require('graphql-tag');

module.exports = gql`

    input ReservationListInput {
      skip: Int = 0
      limit: Int = 10
    }

    type ReservationList implements Paginatable {
      items: [Reservation]!
      hasNext: Boolean,
      total: Int,
    }

    type Reservation {
      id: ID!,
      type: String,
      timestamp: String,
      corId: ID,
      content: ReservationContent
    }

    type ReservationContent {
      zaloPatientId: ID,
      zaloDoctorId: ID,
      reservationTime: String
    }

    input ReservationRequestListInput {
      skip: Int = 0
      limit: Int = 10
    }

    type ReservationRequestList {
      items: [ReservationRequest]!
      hasNext: Boolean,
      total: Int,
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

    type ReservationRequestPayLoad {
      patient: String,
      bookingOptions: [bookingOptions!]!
    }

    input bookingOptionsInput {
      doctor: ID!,
      time: Float!,
    }

    type bookingOptions {
      doctor: ID!,
      time: Float!,
    }
 
    input ReservationInput {
      patient: String,
      bookingOptions: [bookingOptionsInput!]!
    }
    
    type Query {
      reservationList(query: ReservationListInput): ReservationList  @isAuthenticated
      reservationRequestList(query: ReservationRequestListInput): ReservationRequestList  @isAuthenticated
    }

    type Mutation {
      createReservationRequest(reservation: ReservationInput!): ReservationRequest  @isAuthenticated
    }
`;
