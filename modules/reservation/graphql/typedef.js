const gql = require('graphql-tag');

module.exports = gql`
    type ReservationList implements Paginatable {
      items: [Reservation]!
      hasNext: Boolean,
      total: Int,
    }
    type Patient {
      id: ID,
      name: String,
    }
    type Reservation {
      id: ID!,
      type: String,
      timestamp: Float,
      corId: ID,
      doctor: User,
      patient: Patient,
      time: Float
    }

    type ReservationRequestList {
      items: [ReservationRequest]!
      hasNext: Boolean,
      total: Int,
    }

    type ReservationRequest {
      id: ID!,
      source: String,
      corId: ID,
      timestamp: String,
      sender: User,
      recipient: Patient,
      messageId: ID,
      patient: ZaloInterestedUser,
      doctors: [ReservationOption]
    }

    input ReservationOptionsInput {
      id: ID!,
      time: Float!,
    }

    type ReservationOption {
      name: String,
      id: ID,
      time: Float!,
    }
 
    input ReservationRequestInput {
      patient: String,
      doctors: [ReservationOptionsInput!]!
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
