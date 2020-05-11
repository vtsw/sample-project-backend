

module.exports = {
  Query: {
    reservation: async (_, { }, { container }) => {
      return 'reservation';
    },
  
  },

  Mutation : {
    sendExamimationReservationMessage: (_, {reservation}, { container, req }) => {
      console.log('12312312', reservation.patient);

      const zaloInterestedUserProvider = container.resolve('zaloInterestedUserProvider');
      return '12313';
    },
  }
};
