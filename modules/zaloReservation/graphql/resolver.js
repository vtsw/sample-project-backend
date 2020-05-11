const { isEmpty } = require('lodash');
const { ResourceNotFoundError } = require('../../errors');


module.exports = {
  Query: {
    reservation: async (_, { args }, { container }) => {
      return '1111'
    },
  },

  Mutation: {
    sendExamimationReservationMessage: async (__, reservation, { container, req }) => {
      console.log('123', reservation);
    
      return '12312';
    },

    sendTreatmentReservationMessage: async  (_, reservation, { container, req }) => {

      console.log('123');
    
      return '12312';
    },

  }

  // sendExamimationReservationMessage
};
