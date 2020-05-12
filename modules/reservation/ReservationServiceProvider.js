const { asClass } = require('awilix');
const fetch = require('node-fetch');
const ServiceProvider = require('../../ServiceProvider');
const ReservationProvider = require('../reservation/ReservationProvider');
const ReservationTemplateProvider  = require('../reservation/ReservationTemplateProvider');
const ReservationEventHandlerProvider = require('../reservation/ReservationEventHandlerProvider');
class ReservationServiceProvider extends ServiceProvider {
  register() {
    this.container.register('reservationProvider', asClass(ReservationProvider)
      .inject((injectedContainer) => ({ reservation: injectedContainer.resolve('db').collection('reservation') }))
      .singleton());
    this.container.register('reservationTemplateProvider', asClass(ReservationTemplateProvider)
      .inject((injectedContainer) => ({ reservationTemplate: injectedContainer.resolve('db').collection('reservationTemplate') }))
      .singleton());
  }

  async boot() {
    
  }
}

module.exports = ReservationServiceProvider;
