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
      timestamp: Float,
      corId: ID,
      doctor: User,
      patient: ZaloInterestedUser,
      reservationTime: Float
    }

    type ReservationContent {
      zaloPatientId: ID,
      zaloDoctorId: ID,
      time: Float
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
      userId: String,
      source: String,
      corID: ID,
      timestamp: String,
      zaloMessageId: ID,
      payload: ReservationRequestPayLoad,
    }

    type ReservationRequestPayLoad {
      patient: ID!,
      bookingOptions: [BookingOption!]!
    }

    input bookingOptionsInput {
      doctor: ID!,
      time: Float!,
    }

    type BookingOption {
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

    extend type Subscription  {
      onReservationConfirmed: Reservation
    }
`;
