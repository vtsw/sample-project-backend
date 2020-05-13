const { asClass } = require('awilix');
const fetch = require('node-fetch');
const ServiceProvider = require('../../ServiceProvider');
const ReservationProvider = require('../reservation/ReservationProvider');
const ReservationTemplateProvider  = require('../reservation/ReservationTemplateProvider');
const ReservationRequestProvider = require('../reservation/ReservationRequestProvider');
class ReservationServiceProvider extends ServiceProvider {
  register() {
    this.container.register('reservationProvider', asClass(ReservationProvider)
      .inject((injectedContainer) => ({ reservation: injectedContainer.resolve('db').collection('reservation') }))
      .singleton());
    this.container.register('reservationTemplateProvider', asClass(ReservationTemplateProvider)
      .inject((injectedContainer) => ({ reservationTemplate: injectedContainer.resolve('db').collection('reservationTemplate') }))
      .singleton());
    this.container.register('reservationRequestProvider', asClass(ReservationRequestProvider)
      .inject((injectedContainer) => ({ reservationRequest: injectedContainer.resolve('db').collection('reservationRequest') }))
      .singleton());
  }

  async boot() {
    
  }
}

module.exports = ReservationServiceProvider;
