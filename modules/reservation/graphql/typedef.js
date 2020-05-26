const gql = require('graphql-tag');

module.exports = gql`
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
      patient: ZaloInterestedUser,
      doctors: [BookingOption]
    }

    input bookingOptionsInput {
      doctor: ID!,
      time: Float!,
    }

    type BookingOption {
      name: String,
      id: ID,
      doctor: ID!,
      time: Float!,
    }
 
    input ReservationRequestInput {
      patient: String,
      bookingOptions: [bookingOptionsInput!]!
    }
    
    type Query {
      reservationList(query: DefaultPaginationInput): ReservationList  @isAuthenticated
      reservationRequestList(query: DefaultPaginationInput): ReservationRequestList @isAuthenticated
    }

    type Mutation {
      createReservationRequest(reservation: ReservationRequestInput!): ReservationRequest @isAuthenticated
    }

    extend type Subscription  {
      onReservationConfirmed: Reservation
    }
`;
