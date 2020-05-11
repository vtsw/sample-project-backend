const { isEmpty } = require('lodash');
const { ResourceNotFoundError } = require('../../errors');


module.exports = {
  Query: {
    reservation: async (_, { }, { container }) => {
      return '1312312321';
    },
  
  },

  Mutation : {
    sendExamimationReservationMessage: (_, {reservation}, { container, req }) => {
      console.log('12312312', reservation.patient);
      return '12313';
    },
  }
};
